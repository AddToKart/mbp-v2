import { Metadata } from "next";
import { fetchServiceBySlug, fetchWasteSchedule } from "@/lib/services";
import WasteManagementContent from "./WasteManagementContent";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export const metadata: Metadata = {
  title: "Waste Management",
  description:
    "Check waste collection schedules, recycling programs, and environmental compliance in Santa Maria, Bulacan.",
  openGraph: {
    title: "Waste Management | Santa Maria Municipal",
    description:
      "Check waste collection schedules and recycling programs in Santa Maria, Bulacan.",
    url: `${siteUrl}/services/waste`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/services/waste`,
  },
};

export default async function WastePage() {
  const [service, schedule] = await Promise.all([
    fetchServiceBySlug("waste"),
    fetchWasteSchedule(),
  ]);

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Services", url: `${siteUrl}/#services` },
    { name: "Waste Management", url: `${siteUrl}/services/waste` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main className="min-h-screen">
        <WasteManagementContent service={service} schedule={schedule} />
        <Footer />
      </main>
    </>
  );
}
