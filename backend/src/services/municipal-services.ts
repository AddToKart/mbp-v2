import { db } from "../db/client.js";

export type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  color: string;
  requirements: string;
  steps: string;
  fees: string;
  officeHours: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  isOnlineAvailable: number;
  onlineFormUrl: string | null;
  isActive: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function getAllServices(includeInactive = false): ServiceRow[] {
  const query = includeInactive
    ? `SELECT 
        id, slug, name, 
        short_description as shortDescription,
        full_description as fullDescription,
        icon, color, requirements, steps, fees,
        office_hours as officeHours,
        location, contact_phone as contactPhone,
        contact_email as contactEmail,
        is_online_available as isOnlineAvailable,
        online_form_url as onlineFormUrl,
        is_active as isActive,
        sort_order as sortOrder,
        created_at as createdAt,
        updated_at as updatedAt
       FROM services ORDER BY sort_order ASC`
    : `SELECT 
        id, slug, name, 
        short_description as shortDescription,
        full_description as fullDescription,
        icon, color, requirements, steps, fees,
        office_hours as officeHours,
        location, contact_phone as contactPhone,
        contact_email as contactEmail,
        is_online_available as isOnlineAvailable,
        online_form_url as onlineFormUrl,
        is_active as isActive,
        sort_order as sortOrder,
        created_at as createdAt,
        updated_at as updatedAt
       FROM services WHERE is_active = 1 ORDER BY sort_order ASC`;

  return db.prepare(query).all() as ServiceRow[];
}

export function getServiceBySlug(slug: string): ServiceRow | undefined {
  const query = `
    SELECT 
      id, slug, name, 
      short_description as shortDescription,
      full_description as fullDescription,
      icon, color, requirements, steps, fees,
      office_hours as officeHours,
      location, contact_phone as contactPhone,
      contact_email as contactEmail,
      is_online_available as isOnlineAvailable,
      online_form_url as onlineFormUrl,
      is_active as isActive,
      sort_order as sortOrder,
      created_at as createdAt,
      updated_at as updatedAt
    FROM services WHERE slug = ? AND is_active = 1
  `;

  return db.prepare(query).get(slug) as ServiceRow | undefined;
}

export type JobListingRow = {
  id: number;
  slug: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  location: string;
  employmentType: string;
  salaryRange: string | null;
  description: string;
  requirements: string;
  benefits: string;
  contactEmail: string;
  contactPhone: string | null;
  applicationDeadline: string | null;
  isActive: number;
  isFeatured: number;
  createdAt: string;
  updatedAt: string;
};

export function getAllJobListings(
  limit = 20,
  offset = 0,
  featured?: boolean
): JobListingRow[] {
  let query = `
    SELECT 
      id, slug, title,
      company_name as companyName,
      company_logo as companyLogo,
      location, employment_type as employmentType,
      salary_range as salaryRange,
      description, requirements, benefits,
      contact_email as contactEmail,
      contact_phone as contactPhone,
      application_deadline as applicationDeadline,
      is_active as isActive,
      is_featured as isFeatured,
      created_at as createdAt,
      updated_at as updatedAt
    FROM job_listings 
    WHERE is_active = 1
  `;

  if (featured !== undefined) {
    query += ` AND is_featured = ${featured ? 1 : 0}`;
  }

  query += ` ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`;

  return db.prepare(query).all(limit, offset) as JobListingRow[];
}

export function getJobListingBySlug(slug: string): JobListingRow | undefined {
  const query = `
    SELECT 
      id, slug, title,
      company_name as companyName,
      company_logo as companyLogo,
      location, employment_type as employmentType,
      salary_range as salaryRange,
      description, requirements, benefits,
      contact_email as contactEmail,
      contact_phone as contactPhone,
      application_deadline as applicationDeadline,
      is_active as isActive,
      is_featured as isFeatured,
      created_at as createdAt,
      updated_at as updatedAt
    FROM job_listings 
    WHERE slug = ? AND is_active = 1
  `;

  return db.prepare(query).get(slug) as JobListingRow | undefined;
}

export function getJobListingsCount(featured?: boolean): number {
  let query = "SELECT COUNT(*) as count FROM job_listings WHERE is_active = 1";
  if (featured !== undefined) {
    query += ` AND is_featured = ${featured ? 1 : 0}`;
  }
  const result = db.prepare(query).get() as { count: number };
  return result.count;
}

export type TourismItemRow = {
  id: number;
  slug: string;
  title: string;
  type: "attraction" | "event";
  shortDescription: string;
  fullDescription: string;
  featuredImage: string | null;
  galleryImages: string;
  location: string;
  mapCoordinates: string | null;
  openingHours: string | null;
  entranceFee: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  isFeatured: number;
  isActive: number;
  eventStartDate: string | null;
  eventEndDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export function getAllTourismItems(
  limit = 20,
  offset = 0,
  type?: "attraction" | "event"
): TourismItemRow[] {
  let query = `
    SELECT 
      id, slug, title, type,
      short_description as shortDescription,
      full_description as fullDescription,
      featured_image as featuredImage,
      gallery_images as galleryImages,
      location, map_coordinates as mapCoordinates,
      opening_hours as openingHours,
      entrance_fee as entranceFee,
      contact_phone as contactPhone,
      contact_email as contactEmail,
      website_url as websiteUrl,
      is_featured as isFeatured,
      is_active as isActive,
      event_start_date as eventStartDate,
      event_end_date as eventEndDate,
      created_at as createdAt,
      updated_at as updatedAt
    FROM tourism_items 
    WHERE is_active = 1
  `;

  if (type) {
    query += ` AND type = '${type}'`;
  }

  query += ` ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`;

  return db.prepare(query).all(limit, offset) as TourismItemRow[];
}

export function getTourismItemBySlug(slug: string): TourismItemRow | undefined {
  const query = `
    SELECT 
      id, slug, title, type,
      short_description as shortDescription,
      full_description as fullDescription,
      featured_image as featuredImage,
      gallery_images as galleryImages,
      location, map_coordinates as mapCoordinates,
      opening_hours as openingHours,
      entrance_fee as entranceFee,
      contact_phone as contactPhone,
      contact_email as contactEmail,
      website_url as websiteUrl,
      is_featured as isFeatured,
      is_active as isActive,
      event_start_date as eventStartDate,
      event_end_date as eventEndDate,
      created_at as createdAt,
      updated_at as updatedAt
    FROM tourism_items 
    WHERE slug = ? AND is_active = 1
  `;

  return db.prepare(query).get(slug) as TourismItemRow | undefined;
}

export function getTourismItemsCount(type?: "attraction" | "event"): number {
  let query = "SELECT COUNT(*) as count FROM tourism_items WHERE is_active = 1";
  if (type) {
    query += ` AND type = '${type}'`;
  }
  const result = db.prepare(query).get() as { count: number };
  return result.count;
}

// Waste collection schedules (static data for now)
export const wasteCollectionSchedule = {
  zones: [
    {
      name: "Zone A - Poblacion",
      barangays: ["Poblacion", "Bagbaguin", "Balasing"],
      schedule: {
        biodegradable: ["Monday", "Thursday"],
        recyclable: ["Tuesday"],
        residual: ["Friday"],
      },
    },
    {
      name: "Zone B - North",
      barangays: ["Catmon", "Pulong Buhangin", "Sta. Clara"],
      schedule: {
        biodegradable: ["Tuesday", "Friday"],
        recyclable: ["Wednesday"],
        residual: ["Saturday"],
      },
    },
    {
      name: "Zone C - South",
      barangays: ["Mahabang Parang", "Parada", "Tumana"],
      schedule: {
        biodegradable: ["Wednesday", "Saturday"],
        recyclable: ["Thursday"],
        residual: ["Monday"],
      },
    },
  ],
  guidelines: [
    "Segregate waste into biodegradable, recyclable, and residual categories",
    "Use transparent bags for recyclables",
    "Place waste bins outside by 6:00 AM on collection days",
    "Do not mix hazardous waste with regular garbage",
    "For bulky items or special waste, schedule a pickup with MENRO",
  ],
};
