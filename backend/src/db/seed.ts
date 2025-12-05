import bcrypt from "bcryptjs";
import { env } from "../env.js";
import { db } from "./client.js";

const defaultCategories = [
  {
    name: "Announcements",
    slug: "announcements",
    description: "Official municipal updates and statements",
    color: "#6366f1",
  },
  {
    name: "Reports",
    slug: "reports",
    description: "Financial reports, planning documents, and studies",
    color: "#0ea5e9",
  },
  {
    name: "Events",
    slug: "events",
    description: "Community engagements, forums, and celebrations",
    color: "#10b981",
  },
  {
    name: "Public Services",
    slug: "public-services",
    description: "Essential services offered by the municipality",
    color: "#f97316",
  },
  {
    name: "Community",
    slug: "community",
    description: "Programs and initiatives for residents",
    color: "#ec4899",
  },
  {
    name: "News",
    slug: "news",
    description: "Press releases and media features",
    color: "#22d3ee",
  },
  {
    name: "Environment",
    slug: "environment",
    description: "Sustainability, climate, and resilience efforts",
    color: "#65a30d",
  },
  {
    name: "Health",
    slug: "health",
    description: "Healthcare programs and public health advisories",
    color: "#ef4444",
  },
  {
    name: "Education",
    slug: "education",
    description: "Schools, learning programs, and youth development",
    color: "#8b5cf6",
  },
  {
    name: "Infrastructure",
    slug: "infrastructure",
    description: "Roadworks, utilities, and capital projects",
    color: "#facc15",
  },
];

const defaultServices = [
  {
    slug: "business",
    name: "Business Permits",
    short_description: "Apply or renew business licenses online",
    full_description:
      "The Municipal Business Permits and Licensing Office (BPLO) facilitates the registration, renewal, and regulation of businesses operating within Santa Maria, Bulacan. Our streamlined process ensures compliance with local ordinances while supporting economic growth.",
    icon: "BriefcaseIcon",
    color: "blue",
    requirements: JSON.stringify([
      "Barangay Clearance",
      "DTI/SEC/CDA Registration",
      "Community Tax Certificate (Cedula)",
      "Proof of Business Location (Lease Contract or Land Title)",
      "Fire Safety Inspection Certificate",
      "Sanitary Permit",
      "Environmental Compliance Certificate (if applicable)",
    ]),
    steps: JSON.stringify([
      "Secure Barangay Clearance from your business location",
      "Prepare all required documents",
      "Submit application at BPLO window or online portal",
      "Pay assessment fees at the Municipal Treasurer's Office",
      "Wait for processing (3-5 business days)",
      "Claim your Business Permit",
    ]),
    fees: JSON.stringify([
      {
        name: "New Business Registration",
        amount: "₱500 - ₱5,000",
        note: "Based on capitalization",
      },
      {
        name: "Business Permit Renewal",
        amount: "₱300 - ₱3,000",
        note: "Based on gross sales",
      },
      { name: "Barangay Clearance", amount: "₱50 - ₱200", note: "" },
      { name: "Fire Safety Inspection", amount: "₱200 - ₱500", note: "" },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-1234",
    contact_email: "bplo@santamaria.gov.ph",
    is_online_available: 1,
    online_form_url: "https://forms.santamaria.gov.ph/business-permit",
    sort_order: 1,
  },
  {
    slug: "tax",
    name: "Real Property Tax",
    short_description: "Pay your property taxes securely",
    full_description:
      "The Municipal Treasurer's Office handles real property tax assessment and collection. Pay your annual real property tax (amilyar) conveniently through our various payment channels.",
    icon: "BuildingOfficeIcon",
    color: "green",
    requirements: JSON.stringify([
      "Tax Declaration Number",
      "Previous Official Receipt (for verification)",
      "Valid ID",
      "Authorization Letter (if representative)",
    ]),
    steps: JSON.stringify([
      "Visit the Municipal Assessor's Office to verify your property records",
      "Proceed to the Municipal Treasurer's Office",
      "Present your Tax Declaration Number",
      "Pay the assessed amount",
      "Receive your Official Receipt",
    ]),
    fees: JSON.stringify([
      {
        name: "Basic Real Property Tax",
        amount: "1% of assessed value",
        note: "For residential",
      },
      {
        name: "SEF (Special Education Fund)",
        amount: "1% of assessed value",
        note: "",
      },
      {
        name: "Early Payment Discount",
        amount: "10% discount",
        note: "If paid in January",
      },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-5678",
    contact_email: "treasurer@santamaria.gov.ph",
    is_online_available: 1,
    online_form_url: "https://pay.santamaria.gov.ph/rpt",
    sort_order: 2,
  },
  {
    slug: "civil-registry",
    name: "Civil Registry",
    short_description: "Birth, marriage, and death certificates",
    full_description:
      "The Municipal Civil Registry Office maintains vital records of residents including births, marriages, deaths, and legal instruments affecting civil status. Request certified copies or file new registrations.",
    icon: "DocumentTextIcon",
    color: "purple",
    requirements: JSON.stringify([
      "Valid Government ID",
      "Authorization Letter (if requesting for another person)",
      "PSA Copy (for late registration)",
      "Supporting Documents (varies by transaction type)",
    ]),
    steps: JSON.stringify([
      "Fill out the appropriate request form",
      "Submit required documents",
      "Pay processing fees",
      "Wait for processing (1-3 business days)",
      "Claim your certificate",
    ]),
    fees: JSON.stringify([
      { name: "Birth Certificate (Local)", amount: "₱100", note: "" },
      { name: "Marriage Certificate (Local)", amount: "₱100", note: "" },
      { name: "Death Certificate (Local)", amount: "₱100", note: "" },
      {
        name: "Late Registration",
        amount: "₱500",
        note: "Plus publication fees",
      },
      { name: "Certified True Copy", amount: "₱50 per page", note: "" },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-9012",
    contact_email: "lcr@santamaria.gov.ph",
    is_online_available: 0,
    sort_order: 3,
  },
  {
    slug: "health",
    name: "Health Center",
    short_description: "Schedule appointments and checkups",
    full_description:
      "The Municipal Health Office provides primary healthcare services to residents including consultations, immunizations, maternal and child health programs, and preventive health campaigns.",
    icon: "HeartIcon",
    color: "red",
    requirements: JSON.stringify([
      "Valid ID or Barangay Certificate",
      "PhilHealth ID (if member)",
      "Medical records (if follow-up)",
    ]),
    steps: JSON.stringify([
      "Register at the Health Center reception",
      "Wait for your queue number",
      "Proceed to consultation room when called",
      "Receive prescription or referral if needed",
      "Claim medicines from the pharmacy (if available)",
    ]),
    fees: JSON.stringify([
      { name: "Consultation", amount: "FREE", note: "For residents" },
      {
        name: "Laboratory Tests",
        amount: "₱50 - ₱500",
        note: "Depends on test",
      },
      { name: "Dental Services", amount: "₱50 - ₱200", note: "" },
      { name: "Medical Certificate", amount: "₱50", note: "" },
    ]),
    office_hours:
      "Monday to Friday, 8:00 AM - 5:00 PM; Saturday 8:00 AM - 12:00 PM",
    location: "Santa Maria Health Center, Poblacion, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-3456",
    contact_email: "health@santamaria.gov.ph",
    is_online_available: 1,
    online_form_url: "https://health.santamaria.gov.ph/appointment",
    sort_order: 4,
  },
  {
    slug: "jobs",
    name: "Job Portal",
    short_description: "Find local employment opportunities",
    full_description:
      "The Public Employment Service Office (PESO) connects job seekers with local employers. Browse current openings, attend job fairs, and access career guidance services.",
    icon: "UserGroupIcon",
    color: "orange",
    requirements: JSON.stringify([
      "Updated Resume/CV",
      "Valid ID",
      "TIN (Tax Identification Number)",
      "SSS/PhilHealth/Pag-IBIG Numbers",
      "NBI/Police Clearance (for most employers)",
    ]),
    steps: JSON.stringify([
      "Register at PESO or through online portal",
      "Submit your resume and requirements",
      "Browse available job openings",
      "Apply to positions matching your qualifications",
      "Attend scheduled interviews",
    ]),
    fees: JSON.stringify([
      { name: "PESO Registration", amount: "FREE", note: "" },
      { name: "Job Matching Services", amount: "FREE", note: "" },
      { name: "Career Counseling", amount: "FREE", note: "" },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "2nd Floor, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-7890",
    contact_email: "peso@santamaria.gov.ph",
    is_online_available: 1,
    online_form_url: "https://jobs.santamaria.gov.ph",
    sort_order: 5,
  },
  {
    slug: "waste",
    name: "Waste Management",
    short_description: "Check collection schedules",
    full_description:
      "The Municipal Environment and Natural Resources Office manages solid waste collection, recycling programs, and environmental compliance. View collection schedules and report waste management concerns.",
    icon: "TruckIcon",
    color: "emerald",
    requirements: JSON.stringify([
      "Proper waste segregation (biodegradable, recyclable, residual)",
      "Approved waste containers",
      "Schedule compliance",
    ]),
    steps: JSON.stringify([
      "Segregate waste into biodegradable, recyclable, and residual",
      "Place in designated containers",
      "Bring out containers on scheduled collection days",
      "For special waste, contact MENRO for pickup scheduling",
    ]),
    fees: JSON.stringify([
      {
        name: "Residential Collection",
        amount: "FREE",
        note: "Covered by local taxes",
      },
      {
        name: "Commercial Collection",
        amount: "₱500 - ₱2,000/month",
        note: "Based on volume",
      },
      {
        name: "Special Waste Pickup",
        amount: "₱200 - ₱1,000",
        note: "Electronics, hazardous",
      },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "MENRO Office, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-2345",
    contact_email: "menro@santamaria.gov.ph",
    is_online_available: 0,
    sort_order: 6,
  },
  {
    slug: "education",
    name: "Scholarships",
    short_description: "Apply for educational assistance",
    full_description:
      "The Municipal Social Welfare and Development Office administers various scholarship and educational assistance programs for deserving students from Santa Maria.",
    icon: "AcademicCapIcon",
    color: "yellow",
    requirements: JSON.stringify([
      "Certificate of Residency",
      "Report Card / Transcript of Records",
      "Certificate of Enrollment",
      "Barangay Indigency Certificate (for financial aid)",
      "Birth Certificate",
      "2x2 ID Photos",
    ]),
    steps: JSON.stringify([
      "Check eligibility requirements for specific programs",
      "Prepare all required documents",
      "Submit application during enrollment period",
      "Attend interview if required",
      "Wait for evaluation results",
      "If approved, comply with scholarship requirements",
    ]),
    fees: JSON.stringify([
      { name: "Application Fee", amount: "FREE", note: "" },
      { name: "Processing Fee", amount: "FREE", note: "" },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "MSWDO Office, 2nd Floor, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-6789",
    contact_email: "scholarships@santamaria.gov.ph",
    is_online_available: 1,
    online_form_url: "https://scholar.santamaria.gov.ph/apply",
    sort_order: 7,
  },
  {
    slug: "tourism",
    name: "Tourism",
    short_description: "Discover local attractions and events",
    full_description:
      "The Municipal Tourism Office promotes Santa Maria's cultural heritage, natural attractions, and local products. Discover festivals, historical sites, and agri-tourism destinations.",
    icon: "MapIcon",
    color: "cyan",
    requirements: JSON.stringify([]),
    steps: JSON.stringify([
      "Visit the Tourism Office or browse our online directory",
      "Get information about attractions and events",
      "Book tours or accommodations if needed",
      "Enjoy your visit to Santa Maria!",
    ]),
    fees: JSON.stringify([
      { name: "Tourism Information", amount: "FREE", note: "" },
      {
        name: "Guided Tours",
        amount: "₱200 - ₱500",
        note: "Group rates available",
      },
      {
        name: "Event Registration",
        amount: "Varies",
        note: "Depends on event",
      },
    ]),
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Tourism Office, Municipal Hall, Santa Maria, Bulacan",
    contact_phone: "+63 (44) 641-0123",
    contact_email: "tourism@santamaria.gov.ph",
    is_online_available: 1,
    online_form_url: "https://tourism.santamaria.gov.ph",
    sort_order: 8,
  },
];

const defaultJobListings = [
  {
    slug: "admin-assistant-bplo",
    title: "Administrative Assistant",
    company_name: "Municipal Business Permits Office",
    location: "Santa Maria, Bulacan",
    employment_type: "full-time",
    salary_range: "₱15,000 - ₱18,000/month",
    description:
      "We are looking for a detail-oriented Administrative Assistant to support the Business Permits and Licensing Office operations.",
    requirements: JSON.stringify([
      "Bachelor's degree in Business Administration or related field",
      "At least 1 year of administrative experience",
      "Proficient in MS Office applications",
      "Excellent communication skills",
      "Resident of Santa Maria, Bulacan (preferred)",
    ]),
    benefits: JSON.stringify([
      "Government benefits (GSIS, PhilHealth, Pag-IBIG)",
      "13th month pay",
      "Performance bonus",
      "Training and development opportunities",
    ]),
    contact_email: "hr@santamaria.gov.ph",
    contact_phone: "+63 (44) 641-1234",
    is_featured: 1,
  },
  {
    slug: "nurse-health-center",
    title: "Staff Nurse",
    company_name: "Santa Maria Health Center",
    location: "Santa Maria, Bulacan",
    employment_type: "full-time",
    salary_range: "₱25,000 - ₱32,000/month",
    description:
      "The Municipal Health Office is hiring registered nurses to provide quality healthcare services to residents.",
    requirements: JSON.stringify([
      "Bachelor of Science in Nursing",
      "Valid PRC License",
      "At least 6 months clinical experience",
      "BLS/ACLS certification (preferred)",
      "Willing to work on shifting schedules",
    ]),
    benefits: JSON.stringify([
      "Government benefits",
      "Hazard pay",
      "Continuing education support",
      "Career advancement opportunities",
    ]),
    contact_email: "health@santamaria.gov.ph",
    contact_phone: "+63 (44) 641-3456",
    is_featured: 1,
  },
  {
    slug: "encoder-lcr",
    title: "Data Encoder",
    company_name: "Local Civil Registry Office",
    location: "Santa Maria, Bulacan",
    employment_type: "contractual",
    salary_range: "₱12,000 - ₱15,000/month",
    description:
      "Seeking a fast and accurate data encoder for civil registry document digitization project.",
    requirements: JSON.stringify([
      "At least 2 years of college",
      "Typing speed of at least 40 WPM",
      "Experience in data entry",
      "Attention to detail",
    ]),
    benefits: JSON.stringify(["PhilHealth coverage", "Performance incentives"]),
    contact_email: "lcr@santamaria.gov.ph",
    is_featured: 0,
  },
];

const defaultTourismItems = [
  {
    slug: "grotto-shrine",
    title: "Our Lady of Lourdes Grotto",
    type: "attraction",
    short_description: "A peaceful religious shrine and pilgrimage site",
    full_description:
      "The Our Lady of Lourdes Grotto is one of the most visited religious sites in Santa Maria. Built in the 1950s, this serene shrine features a replica of the Lourdes grotto in France and offers a peaceful atmosphere for prayer and reflection.",
    location: "Brgy. Pulong Buhangin, Santa Maria, Bulacan",
    opening_hours: "Open daily, 6:00 AM - 6:00 PM",
    entrance_fee: "Free",
    is_featured: 1,
  },
  {
    slug: "sta-maria-church",
    title: "Santa Maria Parish Church",
    type: "attraction",
    short_description: "Historic colonial-era church built in 1792",
    full_description:
      "The Santa Maria Parish Church, officially known as the Parish of Our Lady of the Assumption, is a historic Roman Catholic church dating back to 1792. It features Spanish colonial architecture and is a National Cultural Treasure.",
    location: "Poblacion, Santa Maria, Bulacan",
    opening_hours: "Open daily, 5:00 AM - 7:00 PM",
    entrance_fee: "Free",
    is_featured: 1,
  },
  {
    slug: "farm-tourism",
    title: "Agri-Tourism Farms",
    type: "attraction",
    short_description: "Experience rural life and fresh produce",
    full_description:
      "Santa Maria is home to several agri-tourism farms where visitors can experience rural Philippine life, pick fresh fruits and vegetables, and learn about sustainable farming practices.",
    location: "Various locations in Santa Maria",
    opening_hours: "Varies by farm, usually 8:00 AM - 5:00 PM",
    entrance_fee: "₱50 - ₱150 per person",
    is_featured: 1,
  },
  {
    slug: "town-fiesta-2025",
    title: "Santa Maria Town Fiesta 2025",
    type: "event",
    short_description: "Annual celebration honoring the patron saint",
    full_description:
      "Join us for the annual Santa Maria Town Fiesta celebrating the Feast of Our Lady of the Assumption. The week-long celebration features religious processions, cultural performances, food festivals, and community activities.",
    location: "Poblacion and various barangays",
    event_start_date: "2025-08-08",
    event_end_date: "2025-08-15",
    is_featured: 1,
  },
];

const defaultSettings: Record<string, string> = {
  site_title: "Santa Maria Municipal Portal",
  site_tagline: "Trusted information for every resident",
  hero_headline: "Empowering our municipality with service and trust",
  hero_subheadline:
    "Stay informed with timely announcements and convenient public services.",
  contact_email: "info@santamaria.gov",
  contact_phone: "+63 (44) 123-4567",
  contact_address: "123 Municipal Drive, Santa Maria, Bulacan",
};

export function ensureDefaultAdmin() {
  const existing = db
    .prepare("SELECT id FROM admins WHERE email = ?")
    .get(env.DEFAULT_ADMIN_EMAIL);

  if (!existing) {
    const passwordHash = bcrypt.hashSync(env.DEFAULT_ADMIN_PASSWORD, 10);
    db.prepare(
      "INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)"
    ).run(env.DEFAULT_ADMIN_EMAIL, passwordHash, env.DEFAULT_ADMIN_NAME);
  }
}

export function ensureDefaultCategories() {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)`
  );

  defaultCategories.forEach((category) => {
    insert.run(
      category.name,
      category.slug,
      category.description,
      category.color
    );
  });
}

export function ensureDefaultSettings() {
  const insert = db.prepare(
    `INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`
  );

  Object.entries(defaultSettings).forEach(([key, value]) => {
    insert.run(key, value);
  });
}

export function ensureDefaultServices() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO services (
      slug, name, short_description, full_description, icon, color,
      requirements, steps, fees, office_hours, location,
      contact_phone, contact_email, is_online_available, online_form_url, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  defaultServices.forEach((service) => {
    insert.run(
      service.slug,
      service.name,
      service.short_description,
      service.full_description,
      service.icon,
      service.color,
      service.requirements,
      service.steps,
      service.fees,
      service.office_hours,
      service.location,
      service.contact_phone,
      service.contact_email,
      service.is_online_available,
      service.online_form_url || null,
      service.sort_order
    );
  });
}

export function ensureDefaultJobListings() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO job_listings (
      slug, title, company_name, location, employment_type,
      salary_range, description, requirements, benefits,
      contact_email, contact_phone, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  defaultJobListings.forEach((job) => {
    insert.run(
      job.slug,
      job.title,
      job.company_name,
      job.location,
      job.employment_type,
      job.salary_range,
      job.description,
      job.requirements,
      job.benefits,
      job.contact_email,
      job.contact_phone || null,
      job.is_featured
    );
  });
}

export function ensureDefaultTourismItems() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO tourism_items (
      slug, title, type, short_description, full_description,
      location, opening_hours, entrance_fee, event_start_date,
      event_end_date, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  defaultTourismItems.forEach((item) => {
    insert.run(
      item.slug,
      item.title,
      item.type,
      item.short_description,
      item.full_description,
      item.location,
      item.opening_hours || null,
      item.entrance_fee || null,
      item.event_start_date || null,
      item.event_end_date || null,
      item.is_featured
    );
  });
}
