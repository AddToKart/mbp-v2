import Script from "next/script";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    email: string;
  };
}

export function OrganizationSchema({
  name = "Santa Maria Municipal Government",
  url = "https://santamaria.gov.ph",
  logo = "/logo.png",
  description = "Official government portal for Santa Maria, Bulacan, Philippines. Providing municipal services, announcements, and community updates.",
  address = {
    streetAddress: "123 Municipal Drive",
    addressLocality: "Santa Maria",
    addressRegion: "Bulacan",
    postalCode: "3022",
    addressCountry: "PH",
  },
  contactPoint = {
    telephone: "+63-44-641-1234",
    email: "info@santamaria.gov.ph",
  },
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name,
    url,
    logo: `${url}${logo}`,
    description,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contactPoint.telephone,
      email: contactPoint.email,
      contactType: "customer service",
      availableLanguage: ["English", "Filipino"],
    },
    sameAs: [
      "https://www.facebook.com/santamariabulacan",
      "https://twitter.com/santamariaph",
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  category?: string;
}

export function ArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author = "Santa Maria Municipal Government",
  category,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    url,
    image: {
      "@type": "ImageObject",
      url: image,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "GovernmentOrganization",
      name: "Santa Maria Municipal Government",
      logo: {
        "@type": "ImageObject",
        url: "https://santamaria.gov.ph/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(category && { articleSection: category }),
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSearchSchema {
  siteUrl?: string;
}

export function WebsiteSearchSchema({
  siteUrl = "https://santamaria.gov.ph",
}: WebsiteSearchSchema) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Santa Maria Municipal",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/announcements?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-search-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
