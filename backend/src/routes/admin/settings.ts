import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import * as settingsService from "../../services/settings.js";

const updateSettingsSchema = z
  .object({
    siteTitle: z.string().min(1).max(120).optional(),
    siteTagline: z.string().min(1).max(160).optional(),
    heroHeadline: z.string().min(1).max(160).optional(),
    heroSubheadline: z.string().min(1).max(220).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().min(3).max(60).optional(),
    contactAddress: z.string().min(3).max(160).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one setting must be provided",
  });

export async function adminSettingsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/admin/settings",
    { preHandler: fastify.authenticate },
    async function getSettings(_request: FastifyRequest, reply: FastifyReply) {
      const settings = settingsService.loadSettings();
      return reply.send(settings);
    }
  );

  fastify.put<{ Body: z.infer<typeof updateSettingsSchema> }>(
    "/admin/settings",
    { preHandler: fastify.authenticate },
    async function updateSettings(
      request: FastifyRequest<{ Body: z.infer<typeof updateSettingsSchema> }>,
      reply: FastifyReply
    ) {
      const parsed = updateSettingsSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.badRequest(parsed.error.flatten().formErrors.join(", "));
      }

      const updates = parsed.data;

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) {
          return;
        }

        const storageKey = (
          Object.entries(settingsService.settingsKeyMap) as Array<
            [
              keyof typeof settingsService.settingsKeyMap,
              (typeof settingsService.settingsKeyMap)[keyof typeof settingsService.settingsKeyMap],
            ]
          >
        ).find(([, mapped]) => mapped === key)?.[0];

        if (!storageKey) {
          return;
        }

        settingsService.saveSetting(storageKey, value);
      });

      const refreshed = settingsService.loadSettings();
      return reply.send({ updated: true, settings: refreshed });
    }
  );
}
