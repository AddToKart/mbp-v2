import { env } from "@/lib/env";

const API_URL = env.NEXT_PUBLIC_API_URL;

export interface MunicipalService {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  color: string;
  isOnlineAvailable: boolean;
}

export interface MunicipalServiceDetail extends MunicipalService {
  fullDescription: string;
  requirements: string[];
  steps: string[];
  fees: { name: string; amount: string; note?: string }[];
  officeHours: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  onlineFormUrl: string | null;
}

export interface JobListing {
  id: number;
  slug: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  location: string;
  employmentType: string;
  salaryRange: string | null;
  description: string;
  requirements: string[];
  benefits: string[];
  contactEmail: string;
  contactPhone: string | null;
  applicationDeadline: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export interface JobListingsResponse {
  jobs: JobListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TourismItem {
  id: number;
  slug: string;
  title: string;
  type: "attraction" | "event";
  shortDescription: string;
  fullDescription: string;
  featuredImage: string | null;
  galleryImages: string[];
  location: string;
  openingHours: string | null;
  entranceFee: string | null;
  isFeatured: boolean;
  eventStartDate: string | null;
  eventEndDate: string | null;
  createdAt: string;
}

export interface TourismItemDetail extends TourismItem {
  mapCoordinates: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
}

export interface TourismItemsResponse {
  items: TourismItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WasteScheduleZone {
  name: string;
  barangays: string[];
  schedule: {
    biodegradable: string[];
    recyclable: string[];
    residual: string[];
  };
}

export interface WasteSchedule {
  zones: WasteScheduleZone[];
  guidelines: string[];
}

// Fetch all services
export async function fetchServices(): Promise<MunicipalService[]> {
  try {
    const response = await fetch(`${API_URL}/services`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch services");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

// Fetch single service by slug
export async function fetchServiceBySlug(
  slug: string
): Promise<MunicipalServiceDetail | null> {
  try {
    const response = await fetch(`${API_URL}/services/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch service");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

// Fetch job listings
export async function fetchJobListings(
  page = 1,
  limit = 20,
  featured?: boolean
): Promise<JobListingsResponse> {
  try {
    let url = `${API_URL}/jobs?page=${page}&limit=${limit}`;
    if (featured !== undefined) {
      url += `&featured=${featured}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error("Failed to fetch job listings");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return {
      jobs: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

// Fetch single job listing
export async function fetchJobBySlug(slug: string): Promise<JobListing | null> {
  try {
    const response = await fetch(`${API_URL}/jobs/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch job listing");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching job listing:", error);
    return null;
  }
}

// Fetch tourism items
export async function fetchTourismItems(
  page = 1,
  limit = 20,
  type?: "attraction" | "event"
): Promise<TourismItemsResponse> {
  try {
    let url = `${API_URL}/tourism?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tourism items");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tourism items:", error);
    return {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

// Fetch single tourism item
export async function fetchTourismItemBySlug(
  slug: string
): Promise<TourismItemDetail | null> {
  try {
    const response = await fetch(`${API_URL}/tourism/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch tourism item");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tourism item:", error);
    return null;
  }
}

// Fetch waste collection schedule
export async function fetchWasteSchedule(): Promise<WasteSchedule | null> {
  try {
    const response = await fetch(`${API_URL}/waste-schedule`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch waste schedule");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching waste schedule:", error);
    return null;
  }
}
