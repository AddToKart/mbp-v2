import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as analyticsService from "../../services/analytics.js";

export async function adminAnalyticsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/admin/analytics",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function getAnalytics(_request: FastifyRequest, reply: FastifyReply) {
      const summary = analyticsService.getAnalyticsSummary();
      const categoryBreakdown = analyticsService.getCategoryBreakdown();
      const monthlyViews = analyticsService.getMonthlyViews();
      const recentPosts = analyticsService.getRecentPosts();
      const schedule = analyticsService.getUpcomingSchedule();
      const recentActivity = analyticsService.getRecentActivity();

      return reply.send({
        summary,
        categoryBreakdown,
        monthlyViews,
        recentPosts,
        schedule,
        recentActivity,
      });
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/admin/analytics/posts/:id",
    { preHandler: [fastify.authenticate, fastify.requireAdmin] },
    async function getPostAnalytics(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const id = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(id)) {
        return reply.badRequest("Invalid post id");
      }

      const data = analyticsService.getPostAnalytics(id);

      if (!data) {
        return reply.notFound("Post not found");
      }

      return reply.send(data);
    }
  );
}
