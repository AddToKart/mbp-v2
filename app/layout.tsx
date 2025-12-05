import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://santamaria.gov.ph";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Santa Maria Municipal - Official Blog & Announcements",
    template: "%s | Santa Maria Municipal",
  },
  description:
    "Stay updated with the latest announcements, municipal reports, and community updates from Santa Maria Municipal Government, Bulacan, Philippines.",
  keywords: [
    "Santa Maria",
    "Bulacan",
    "municipal government",
    "Philippines",
    "announcements",
    "public services",
    "community updates",
    "local government",
  ],
  authors: [{ name: "Santa Maria Municipal Government" }],
  creator: "Santa Maria Municipal Government",
  publisher: "Santa Maria Municipal Government",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    siteName: "Santa Maria Municipal",
    title: "Santa Maria Municipal - Official Blog & Announcements",
    description:
      "Stay updated with the latest announcements, municipal reports, and community updates from Santa Maria Municipal Government.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Santa Maria Municipal Government",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Santa Maria Municipal - Official Blog & Announcements",
    description:
      "Stay updated with the latest announcements and community updates from Santa Maria Municipal Government.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
(function () {
  try {
    const storedTheme = window.localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (error) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
          `}
        </Script>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
