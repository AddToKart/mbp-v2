import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import {
    ValidatorActionSchema,
    type ValidatorActionRequest,
    type ApplicationResponse,
} from "../../../types/shared.js";

export async function validatorRoutes(fastify: FastifyInstance) {
    // Get Queue (Pending Applications)
    fastify.get(
        "/validator/queue",
        { preHandler: [fastify.authenticate, fastify.requireValidator] },
        async function getQueue(_request: FastifyRequest, reply: FastifyReply) {
            const rows = db
                .prepare(
                    `SELECT a.*, u.email as userEmail
           FROM applications a
           JOIN users u ON a.user_id = u.id
           WHERE a.status = 'pending'
           ORDER BY a.created_at ASC`
                )
                .all() as any[];

            // Transform to camelCase if needed, or rely on frontend to handle snake_case from DB
            // Mapped manually for consistency with shared types
            const applications: ApplicationResponse[] = rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                fullName: row.full_name,
                address: row.address,
                phone: row.phone,
                dob: row.dob,
                idCardFront: row.id_card_front,
                idCardBack: row.id_card_back,
                selfieImage: row.selfie_image,
                aiAnalysisJson: row.ai_analysis_json,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                userEmail: row.userEmail
            }));

            return reply.send(applications);
        }
    );

    // Get Single Application
    fastify.get<{ Params: { id: string } }>(
        "/validator/application/:id",
        { preHandler: [fastify.authenticate, fastify.requireValidator] },
        async function getApplication(
            request: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ) {
            const id = Number.parseInt(request.params.id, 10);
            if (Number.isNaN(id)) return reply.badRequest("Invalid ID");

            const row = db
                .prepare(
                    `SELECT a.*, u.email as userEmail
           FROM applications a
           JOIN users u ON a.user_id = u.id
           WHERE a.id = ?`
                )
                .get(id) as any;

            if (!row) return reply.notFound("Application not found");

            const application: ApplicationResponse = {
                id: row.id,
                userId: row.user_id,
                fullName: row.full_name,
                address: row.address,
                phone: row.phone,
                dob: row.dob,
                idCardFront: row.id_card_front,
                idCardBack: row.id_card_back,
                selfieImage: row.selfie_image,
                aiAnalysisJson: row.ai_analysis_json,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                userEmail: row.userEmail
            };

            return reply.send(application);
        }
    );

    // Submit Action (Approve/Reject)
    fastify.post<{ Body: ValidatorActionRequest }>(
        "/validator/action",
        { preHandler: [fastify.authenticate, fastify.requireValidator] },
        async function submitAction(
            request: FastifyRequest<{ Body: ValidatorActionRequest }>,
            reply: FastifyReply
        ) {
            const parsed = ValidatorActionSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
            }

            const { applicationId, action, notes } = parsed.data;
            const validatorId = request.user.id;

            const app = db.prepare("SELECT user_id, status FROM applications WHERE id = ?").get(applicationId) as { user_id: number, status: string } | undefined;

            if (!app) return reply.notFound("Application not found");
            if (app.status !== 'pending') return reply.conflict("Application is not pending");

            let newStatus: string;
            let userStatus: string;

            switch (action) {
                case "approve":
                    newStatus = "approved";
                    userStatus = "approved";
                    break;
                case "reject":
                    newStatus = "rejected";
                    userStatus = "rejected";
                    break;
                case "request_info":
                    newStatus = "needs_info";
                    userStatus = "needs_info";
                    break;
            }

            const txn = db.transaction(() => {
                // 1. Log Action
                db.prepare(
                    `INSERT INTO validator_actions (application_id, validator_id, action, notes)
           VALUES (?, ?, ?, ?)`
                ).run(applicationId, validatorId, action, notes || null);

                // 2. Update Application Status
                db.prepare(
                    `UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
                ).run(newStatus, applicationId);

                // 3. Update User Status
                db.prepare(
                    `UPDATE users 
           SET verification_status = ?, 
               rejection_reason = ?, 
               rejection_date = ? 
           WHERE id = ?`
                ).run(
                    userStatus,
                    action === 'reject' ? notes : null,
                    action === 'reject' ? new Date().toISOString() : null,
                    app.user_id
                );
            });

            try {
                txn();
            } catch (err) {
                fastify.log.error(err);
                return reply.internalServerError("Action failed");
            }

            return { message: "Action recorded successfully", newStatus };
        }
    );

    // Get Application History (Approved/Rejected/Needs Info)
    fastify.get<{ Querystring: { status?: string } }>(
        "/validator/history",
        { preHandler: [fastify.authenticate, fastify.requireValidator] },
        async function getHistory(
            request: FastifyRequest<{ Querystring: { status?: string } }>,
            reply: FastifyReply
        ) {
            const { status } = request.query;

            let query = `
                SELECT a.*, u.email as userEmail
                FROM applications a
                JOIN users u ON a.user_id = u.id
                WHERE a.status IN ('approved', 'rejected', 'needs_info')
            `;

            const params: any[] = [];

            if (status === 'approved' || status === 'rejected' || status === 'needs_info') {
                query = `
                    SELECT a.*, u.email as userEmail
                    FROM applications a
                    JOIN users u ON a.user_id = u.id
                    WHERE a.status = ?
                `;
                params.push(status);
            }

            query += ` ORDER BY a.updated_at DESC`;

            const rows = db.prepare(query).all(...params) as any[];

            const applications: ApplicationResponse[] = rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                fullName: row.full_name,
                address: row.address,
                phone: row.phone,
                dob: row.dob,
                idCardFront: row.id_card_front,
                idCardBack: row.id_card_back,
                selfieImage: row.selfie_image,
                aiAnalysisJson: row.ai_analysis_json,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                userEmail: row.userEmail
            }));

            return reply.send(applications);
        }
    );

    // Reopen Application for Re-review
    fastify.post<{ Params: { id: string } }>(
        "/validator/application/:id/reopen",
        { preHandler: [fastify.authenticate, fastify.requireValidator] },
        async function reopenApplication(
            request: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ) {
            const id = Number.parseInt(request.params.id, 10);
            if (Number.isNaN(id)) return reply.badRequest("Invalid ID");

            const app = db.prepare(
                "SELECT id, user_id, status FROM applications WHERE id = ?"
            ).get(id) as { id: number; user_id: number; status: string } | undefined;

            if (!app) return reply.notFound("Application not found");
            if (app.status === 'pending') {
                return reply.conflict("Application is already pending");
            }

            const validatorId = request.user.id;

            const txn = db.transaction(() => {
                // 1. Update application status to pending
                db.prepare(
                    `UPDATE applications SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
                ).run(id);

                // 2. Update user's verification status to pending
                db.prepare(
                    `UPDATE users SET 
                     verification_status = 'pending',
                     rejection_reason = NULL,
                     rejection_date = NULL,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`
                ).run(app.user_id);

                // 3. Log the reopen action
                db.prepare(
                    `INSERT INTO validator_actions (application_id, validator_id, action, notes)
                     VALUES (?, ?, 'reopen', 'Application reopened for re-review')`
                ).run(id, validatorId);
            });

            try {
                txn();
            } catch (err) {
                fastify.log.error(err);
                return reply.internalServerError("Failed to reopen application");
            }

            return { message: "Application reopened for re-review", applicationId: id };
        }
    );
}
