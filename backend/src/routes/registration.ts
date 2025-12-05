import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import * as userService from "../services/users.js";
import * as tokenService from "../services/tokens.js";
import {
    RegisterStep1Schema,
    RegisterStep2Schema,
    RegisterStep3Schema,
    type RegisterStep1Request,
    type RegisterStep2Request,
    type RegisterStep3Request,
} from "../../../types/shared.js";
import { env } from "../env.js";

const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
};

export async function registrationRoutes(fastify: FastifyInstance) {
    // Step 1: Personal Information & User Account Creation
    fastify.post<{ Body: RegisterStep1Request }>(
        "/register/step1",
        async function registerStep1(
            request: FastifyRequest<{ Body: RegisterStep1Request }>,
            reply: FastifyReply
        ) {
            const parsed = RegisterStep1Schema.safeParse(request.body);

            if (!parsed.success) {
                return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
            }

            const { email, password, firstName, middleName, lastName, address, phone, dob } = parsed.data;
            const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

            // Check if email exists
            const existingUser = userService.getUserByEmail(email) as {
                id: number;
                verification_status: string;
                rejection_date: string | null;
            } | undefined;

            let userId: number;
            let isReapplication = false;

            if (existingUser) {
                // If rejected, allow reapplication
                if (existingUser.verification_status === 'rejected') {
                    // TODO: Re-enable 3-day cooldown after testing
                    // const rejectionDate = new Date(existingUser.rejection_date);
                    // const cooldownEnd = new Date(rejectionDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
                    // const now = new Date();
                    // if (now < cooldownEnd) {
                    //     const remainingMs = cooldownEnd.getTime() - now.getTime();
                    //     const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
                    //     const remainingDays = Math.ceil(remainingHours / 24);
                    //     return reply.status(429).send({
                    //         message: `You must wait ${remainingDays} day(s) before re-applying.`,
                    //         canReapplyAt: cooldownEnd.toISOString(),
                    //         remainingHours
                    //     });
                    // }

                    // 3 days have passed - REAPPLICATION FLOW
                    isReapplication = true;
                    userId = existingUser.id;

                    const txn = db.transaction(() => {
                        // 1. Update user's verification status back to pending
                        db.prepare(
                            `UPDATE users SET 
                             verification_status = 'pending',
                             name = ?,
                             rejection_reason = NULL,
                             rejection_date = NULL,
                             updated_at = CURRENT_TIMESTAMP
                             WHERE id = ?`
                        ).run(fullName, userId);

                        // 2. Create NEW application (keep old ones for history)
                        db.prepare(
                            `INSERT INTO applications (user_id, full_name, address, phone, dob, status)
                             VALUES (?, ?, ?, ?, ?, 'pending')`
                        ).run(userId, fullName, address, phone, dob);
                    });

                    try {
                        txn();
                    } catch (err) {
                        fastify.log.error(err);
                        return reply.internalServerError("Reapplication failed");
                    }
                } else {
                    return reply.conflict("Email already registered");
                }
            } else {
                // NEW USER FLOW
                const passwordHash = userService.hashPassword(password);

                const txn = db.transaction(() => {
                    const createUserResult = db
                        .prepare(
                            `INSERT INTO users (email, password_hash, name, role, verification_status)
                             VALUES (?, ?, ?, 'citizen', 'pending')`
                        )
                        .run(email, passwordHash, fullName);

                    const newUserId = createUserResult.lastInsertRowid as number;

                    db.prepare(
                        `INSERT INTO applications (user_id, full_name, address, phone, dob, status)
                         VALUES (?, ?, ?, ?, ?, 'pending')`
                    ).run(newUserId, fullName, address, phone, dob);

                    return newUserId;
                });

                try {
                    userId = txn();
                } catch (err) {
                    fastify.log.error(err);
                    return reply.internalServerError("Registration failed");
                }
            }

            // Generate tokens & login (shared for both new users and reapplications)
            const accessToken = fastify.jwt.sign(
                {
                    id: userId,
                    email,
                    name: fullName,
                    role: "citizen",
                    verificationStatus: "pending",
                },
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            const userAgent = request.headers["user-agent"];
            const ipAddress = request.ip;
            const refreshToken = tokenService.createRefreshToken(
                userId,
                userAgent,
                ipAddress
            );

            reply.setCookie("access_token", accessToken, {
                ...cookieOptions,
                maxAge: COOKIE_MAX_AGE,
            });

            reply.setCookie("refresh_token", refreshToken, {
                ...cookieOptions,
                maxAge: REFRESH_COOKIE_MAX_AGE,
                path: "/",
            });

            return {
                message: isReapplication ? "Reapplication submitted" : "Step 1 completed",
                user: { id: userId, email, name: fullName, role: "citizen", verificationStatus: "pending" },
                token: accessToken,
                isReapplication,
            };
        }
    );

    // Step 2: ID Upload
    fastify.post<{ Body: RegisterStep2Request }>(
        "/register/step2",
        { preHandler: fastify.authenticate },
        async function registerStep2(
            request: FastifyRequest<{ Body: RegisterStep2Request }>,
            reply: FastifyReply
        ) {
            const parsed = RegisterStep2Schema.safeParse(request.body);
            if (!parsed.success) {
                return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
            }

            const userId = request.user.id;

            // Update application
            const result = db.prepare(
                `UPDATE applications 
         SET id_card_front = ?, id_card_back = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`
            ).run(parsed.data.idCardFront, parsed.data.idCardBack, userId);

            if (result.changes === 0) {
                return reply.notFound("Application not found");
            }

            return { message: "ID uploaded successfully" };
        }
    );

    // Step 3: Selfie & Verification
    fastify.post<{ Body: RegisterStep3Request }>(
        "/register/step3",
        { preHandler: fastify.authenticate },
        async function registerStep3(
            request: FastifyRequest<{ Body: RegisterStep3Request }>,
            reply: FastifyReply
        ) {
            const parsed = RegisterStep3Schema.safeParse(request.body);
            if (!parsed.success) {
                return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
            }

            const userId = request.user.id;

            const txn = db.transaction(() => {
                // 1. Update Application
                db.prepare(
                    `UPDATE applications 
           SET selfie_image = ?, ai_analysis_json = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`
                ).run(parsed.data.selfieImage, parsed.data.aiAnalysis || null, userId);

                // 2. Update User Verification Status
                db.prepare(
                    `UPDATE users SET verification_status = 'pending' WHERE id = ?`
                ).run(userId);
            });

            try {
                txn();
            } catch (err) {
                fastify.log.error(err);
                return reply.internalServerError("Verification submission failed");
            }

            return { message: "Application submitted for review" };
        }
    );

    // Get previous application data for reapplication
    fastify.get(
        "/register/previous-application",
        { preHandler: [fastify.authenticate] },
        async function getPreviousApplication(
            request: FastifyRequest,
            reply: FastifyReply
        ) {
            const userId = request.user.id;

            // Get the most recent application for this user
            const app = db.prepare(
                `SELECT a.*, u.email, u.name as userName
                 FROM applications a
                 JOIN users u ON a.user_id = u.id
                 WHERE a.user_id = ?
                 ORDER BY a.created_at DESC
                 LIMIT 1`
            ).get(userId) as any;

            if (!app) {
                return reply.notFound("No previous application found");
            }

            // Parse the name into parts
            const nameParts = app.full_name?.split(' ') || [];

            return {
                email: app.email,
                firstName: nameParts[0] || '',
                middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
                lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
                fullName: app.full_name,
                address: app.address,
                phone: app.phone,
                dob: app.dob,
                idCardFront: app.id_card_front,
                idCardBack: app.id_card_back,
                selfieImage: app.selfie_image,
            };
        }
    );

    // Streamlined reapply endpoint - creates new application with existing user
    fastify.post(
        "/register/reapply",
        { preHandler: [fastify.authenticate] },
        async function reapply(
            request: FastifyRequest,
            reply: FastifyReply
        ) {
            const userId = request.user.id;

            // Check if user is rejected
            const user = db.prepare(
                "SELECT id, email, name, verification_status FROM users WHERE id = ?"
            ).get(userId) as { id: number; email: string; name: string; verification_status: string } | undefined;

            if (!user) {
                return reply.notFound("User not found");
            }

            if (user.verification_status !== 'rejected') {
                return reply.conflict("Can only reapply if previous application was rejected");
            }

            // Get the most recent application to copy data
            const prevApp = db.prepare(
                `SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
            ).get(userId) as any;

            if (!prevApp) {
                return reply.notFound("No previous application found");
            }

            const txn = db.transaction(() => {
                // 1. Update user's verification status to pending
                db.prepare(
                    `UPDATE users SET 
                     verification_status = 'pending',
                     rejection_reason = NULL,
                     rejection_date = NULL,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`
                ).run(userId);

                // 2. Update the existing application status back to pending
                db.prepare(
                    `UPDATE applications SET 
                     status = 'pending',
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`
                ).run(prevApp.id);

                return prevApp.id;
            });

            let newAppId: number | bigint;
            try {
                newAppId = txn();
            } catch (err) {
                fastify.log.error(err);
                return reply.internalServerError("Reapplication failed");
            }

            // Generate new tokens
            const accessToken = fastify.jwt.sign(
                {
                    id: userId,
                    email: user.email,
                    name: user.name,
                    role: "citizen",
                    verificationStatus: "pending",
                },
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            const userAgent = request.headers["user-agent"];
            const ipAddress = request.ip;
            const refreshToken = tokenService.createRefreshToken(
                userId,
                userAgent,
                ipAddress
            );

            reply.setCookie("access_token", accessToken, {
                ...cookieOptions,
                maxAge: COOKIE_MAX_AGE,
            });

            reply.setCookie("refresh_token", refreshToken, {
                ...cookieOptions,
                maxAge: REFRESH_COOKIE_MAX_AGE,
                path: "/",
            });

            return {
                message: "Reapplication submitted successfully",
                applicationId: newAppId,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                    role: "citizen",
                    verificationStatus: "pending",
                },
            };
        }
    );

    // Update application and reapply with new data
    fastify.post<{
        Body: {
            firstName?: string;
            middleName?: string;
            lastName?: string;
            address?: string;
            phone?: string;
            dob?: string;
            idCardFront?: string;
            idCardBack?: string;
            selfieImage?: string;
        }
    }>(
        "/register/reapply-with-changes",
        { preHandler: [fastify.authenticate] },
        async function reapplyWithChanges(
            request: FastifyRequest<{
                Body: {
                    firstName?: string;
                    middleName?: string;
                    lastName?: string;
                    address?: string;
                    phone?: string;
                    dob?: string;
                    idCardFront?: string;
                    idCardBack?: string;
                    selfieImage?: string;
                }
            }>,
            reply: FastifyReply
        ) {
            const userId = request.user.id;
            const updates = request.body;

            // Check if user is rejected
            const user = db.prepare(
                "SELECT id, email, name, verification_status FROM users WHERE id = ?"
            ).get(userId) as { id: number; email: string; name: string; verification_status: string } | undefined;

            if (!user) {
                return reply.notFound("User not found");
            }

            if (user.verification_status !== 'rejected') {
                return reply.conflict("Can only reapply if previous application was rejected");
            }

            // Get the existing application
            const prevApp = db.prepare(
                `SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
            ).get(userId) as any;

            if (!prevApp) {
                return reply.notFound("No previous application found");
            }

            // Build the full name from parts
            const fullName = [updates.firstName, updates.middleName, updates.lastName]
                .filter(Boolean)
                .join(' ') || prevApp.full_name;

            const txn = db.transaction(() => {
                // 1. Update user's verification status and name
                db.prepare(
                    `UPDATE users SET 
                     verification_status = 'pending',
                     name = ?,
                     rejection_reason = NULL,
                     rejection_date = NULL,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`
                ).run(fullName, userId);

                // 2. Update the existing application with new data
                db.prepare(
                    `UPDATE applications SET 
                     full_name = ?,
                     address = ?,
                     phone = ?,
                     dob = ?,
                     id_card_front = COALESCE(?, id_card_front),
                     id_card_back = COALESCE(?, id_card_back),
                     selfie_image = COALESCE(?, selfie_image),
                     status = 'pending',
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`
                ).run(
                    fullName,
                    updates.address || prevApp.address,
                    updates.phone || prevApp.phone,
                    updates.dob || prevApp.dob,
                    updates.idCardFront || null,
                    updates.idCardBack || null,
                    updates.selfieImage || null,
                    prevApp.id
                );

                return prevApp.id;
            });

            let appId: number | bigint;
            try {
                appId = txn();
            } catch (err) {
                fastify.log.error(err);
                return reply.internalServerError("Reapplication failed");
            }

            // Generate new tokens with updated name
            const accessToken = fastify.jwt.sign(
                {
                    id: userId,
                    email: user.email,
                    name: fullName,
                    role: "citizen",
                    verificationStatus: "pending",
                },
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            const userAgent = request.headers["user-agent"];
            const ipAddress = request.ip;
            const refreshToken = tokenService.createRefreshToken(
                userId,
                userAgent,
                ipAddress
            );

            reply.setCookie("access_token", accessToken, {
                ...cookieOptions,
                maxAge: COOKIE_MAX_AGE,
            });

            reply.setCookie("refresh_token", refreshToken, {
                ...cookieOptions,
                maxAge: REFRESH_COOKIE_MAX_AGE,
                path: "/",
            });

            return {
                message: "Reapplication with updates submitted successfully",
                applicationId: appId,
                user: {
                    id: userId,
                    email: user.email,
                    name: fullName,
                    role: "citizen",
                    verificationStatus: "pending",
                },
            };
        }
    );
}
