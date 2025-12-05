import { Metadata } from "next";
import { fetchServiceBySlug, fetchTourismItems } from "@/lib/services";
import TourismClientWrapper from "./TourismClientWrapper";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export const metadata: Metadata = {
  title: "Tourism",
  description:
    "Discover local attractions, cultural heritage, and events in Santa Maria, Bulacan. Explore historical sites, festivals, and agri-tourism destinations.",
  openGraph: {
    title: "Tourism | Santa Maria Municipal",
    description:
      "Discover local attractions and events in Santa Maria, Bulacan.",
    url: `${siteUrl}/services/tourism`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/services/tourism`,
  },
};

export default async function TourismPage() {
  const [service, tourismData] = await Promise.all([
    fetchServiceBySlug("tourism"),
    fetchTourismItems(1, 20),
  ]);

  return <TourismClientWrapper service={service} initialItems={tourismData} />;
}
