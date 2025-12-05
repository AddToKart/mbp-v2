import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as municipalService from "../../services/municipal-services.js";

// Cache durations in seconds
const CACHE_MEDIUM = 300; // 5 minutes for service data (relatively static)

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setCacheHeaders(reply: FastifyReply, maxAge: number) {
  reply.header(
    "Cache-Control",
    `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  reply.header("Vary", "Accept-Encoding");
}

export async function publicServicesRoutes(fastify: FastifyInstance) {
  // Get all services
  fastify.get("/services", async (request, reply: FastifyReply) => {
    const services = municipalService.getAllServices();

    const formatted = services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDescription: service.shortDescription,
      icon: service.icon,
      color: service.color,
      isOnlineAvailable: Boolean(service.isOnlineAvailable),
    }));

    setCacheHeaders(reply, CACHE_MEDIUM);
    return reply.send(formatted);
  });

  // Get single service by slug
  fastify.get<{ Params: { slug: string } }>(
    "/services/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const service = municipalService.getServiceBySlug(request.params.slug);

      if (!service) {
        return reply.notFound("Service not found");
      }

      const formatted = {
        id: service.id,
        slug: service.slug,
        name: service.name,
        shortDescription: service.shortDescription,
        fullDescription: service.fullDescription,
        icon: service.icon,
        color: service.color,
        requirements: parseJson<string[]>(service.requirements, []),
        steps: parseJson<string[]>(service.steps, []),
        fees: parseJson<{ name: string; amount: string; note?: string }[]>(
          service.fees,
          []
        ),
        officeHours: service.officeHours,
        location: service.location,
        contactPhone: service.contactPhone,
        contactEmail: service.contactEmail,
        isOnlineAvailable: Boolean(service.isOnlineAvailable),
        onlineFormUrl: service.onlineFormUrl,
      };

      setCacheHeaders(reply, CACHE_MEDIUM);
      return reply.send(formatted);
    }
  );

  // Get all job listings
  fastify.get(
    "/jobs",
    async (
      request: FastifyRequest<{
        Querystring: { limit?: string; page?: string; featured?: string };
      }>,
      reply: FastifyReply
    ) => {
      const limit = request.query.limit
        ? Number.parseInt(request.query.limit, 10)
        : 20;
      const safeLimit = Number.isNaN(limit) ? 20 : Math.min(limit, 50);

      const page = request.query.page
        ? Number.parseInt(request.query.page, 10)
        : 1;
      const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
      const offset = (safePage - 1) * safeLimit;

      const featured =
        request.query.featured === "true"
          ? true
          : request.query.featured === "false"
            ? false
            : undefined;

      const jobs = municipalService.getAllJobListings(
        safeLimit,
        offset,
        featured
      );
      const total = municipalService.getJobListingsCount(featured);

      const formatted = jobs.map((job) => ({
        id: job.id,
        slug: job.slug,
        title: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        location: job.location,
        employmentType: job.employmentType,
        salaryRange: job.salaryRange,
        description: job.description,
        requirements: parseJson<string[]>(job.requirements, []),
        benefits: parseJson<string[]>(job.benefits, []),
        contactEmail: job.contactEmail,
        contactPhone: job.contactPhone,
        applicationDeadline: job.applicationDeadline,
        isFeatured: Boolean(job.isFeatured),
        createdAt: job.createdAt,
      }));

      setCacheHeaders(reply, 60); // 1 minute for job listings (more dynamic)
      return reply.send({
        jobs: formatted,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      });
    }
  );

  // Get single job listing
  fastify.get<{ Params: { slug: string } }>(
    "/jobs/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const job = municipalService.getJobListingBySlug(request.params.slug);

      if (!job) {
        return reply.notFound("Job listing not found");
      }

      const formatted = {
        id: job.id,
        slug: job.slug,
        title: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        location: job.location,
        employmentType: job.employmentType,
        salaryRange: job.salaryRange,
        description: job.description,
        requirements: parseJson<string[]>(job.requirements, []),
        benefits: parseJson<string[]>(job.benefits, []),
        contactEmail: job.contactEmail,
        contactPhone: job.contactPhone,
        applicationDeadline: job.applicationDeadline,
        isFeatured: Boolean(job.isFeatured),
        createdAt: job.createdAt,
      };

      setCacheHeaders(reply, CACHE_MEDIUM);
      return reply.send(formatted);
    }
  );

  // Get all tourism items
  fastify.get(
    "/tourism",
    async (
      request: FastifyRequest<{
        Querystring: { limit?: string; page?: string; type?: string };
      }>,
      reply: FastifyReply
    ) => {
      const limit = request.query.limit
        ? Number.parseInt(request.query.limit, 10)
        : 20;
      const safeLimit = Number.isNaN(limit) ? 20 : Math.min(limit, 50);

      const page = request.query.page
        ? Number.parseInt(request.query.page, 10)
        : 1;
      const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
      const offset = (safePage - 1) * safeLimit;

      const type =
        request.query.type === "attraction" || request.query.type === "event"
          ? request.query.type
          : undefined;

      const items = municipalService.getAllTourismItems(
        safeLimit,
        offset,
        type
      );
      const total = municipalService.getTourismItemsCount(type);

      const formatted = items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        type: item.type,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        featuredImage: item.featuredImage,
        galleryImages: parseJson<string[]>(item.galleryImages, []),
        location: item.location,
        openingHours: item.openingHours,
        entranceFee: item.entranceFee,
        isFeatured: Boolean(item.isFeatured),
        eventStartDate: item.eventStartDate,
        eventEndDate: item.eventEndDate,
        createdAt: item.createdAt,
      }));

      setCacheHeaders(reply, CACHE_MEDIUM);
      return reply.send({
        items: formatted,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      });
    }
  );

  // Get single tourism item
  fastify.get<{ Params: { slug: string } }>(
    "/tourism/:slug",
    async (
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ) => {
      const item = municipalService.getTourismItemBySlug(request.params.slug);

      if (!item) {
        return reply.notFound("Tourism item not found");
      }

      const formatted = {
        id: item.id,
        slug: item.slug,
        title: item.title,
        type: item.type,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        featuredImage: item.featuredImage,
        galleryImages: parseJson<string[]>(item.galleryImages, []),
        location: item.location,
        mapCoordinates: item.mapCoordinates,
        openingHours: item.openingHours,
        entranceFee: item.entranceFee,
        contactPhone: item.contactPhone,
        contactEmail: item.contactEmail,
        websiteUrl: item.websiteUrl,
        isFeatured: Boolean(item.isFeatured),
        eventStartDate: item.eventStartDate,
        eventEndDate: item.eventEndDate,
        createdAt: item.createdAt,
      };

      setCacheHeaders(reply, CACHE_MEDIUM);
      return reply.send(formatted);
    }
  );

  // Get waste collection schedule
  fastify.get("/waste-schedule", async (request, reply: FastifyReply) => {
    setCacheHeaders(reply, CACHE_MEDIUM);
    return reply.send(municipalService.wasteCollectionSchedule);
  });
}
