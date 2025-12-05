import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchServiceBySlug } from "@/lib/services";
import ServicePageLayout from "@/components/ServicePageLayout";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export async function generateMetadata(): Promise<Metadata> {
  const service = await fetchServiceBySlug("health");

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.name,
    description: service.shortDescription,
    openGraph: {
      title: `${service.name} | Santa Maria Municipal`,
      description: service.shortDescription,
      url: `${siteUrl}/services/health`,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/services/health`,
    },
  };
}

export default async function HealthCenterPage() {
  const service = await fetchServiceBySlug("health");

  if (!service) {
    notFound();
  }

  return <ServicePageLayout service={service} />;
}
