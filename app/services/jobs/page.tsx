import { Metadata } from "next";
import { fetchServiceBySlug, fetchJobListings } from "@/lib/services";
import JobPortalContent from "./JobPortalContent";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export const metadata: Metadata = {
  title: "Job Portal",
  description:
    "Find local employment opportunities in Santa Maria, Bulacan. Browse current job openings, attend job fairs, and access career guidance services.",
  openGraph: {
    title: "Job Portal | Santa Maria Municipal",
    description: "Find local employment opportunities in Santa Maria, Bulacan.",
    url: `${siteUrl}/services/jobs`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/services/jobs`,
  },
};

export default async function JobsPage() {
  const [service, jobsData] = await Promise.all([
    fetchServiceBySlug("jobs"),
    fetchJobListings(1, 20),
  ]);

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Services", url: `${siteUrl}/#services` },
    { name: "Job Portal", url: `${siteUrl}/services/jobs` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main className="min-h-screen">
        <JobPortalContent service={service} initialJobs={jobsData} />
        <Footer />
      </main>
    </>
  );
}
