import Hero from "@/components/Hero";
import FeaturedAnnouncements from "@/components/FeaturedAnnouncements";
import CategoryNav from "@/components/CategoryNav";
import StatsSection from "@/components/StatsSection";
import BlogGrid from "@/components/BlogGrid";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const NewsletterSection = dynamic(
  () => import("@/components/NewsletterSection"),
  {
    loading: () => (
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-card"
        aria-hidden="true"
      >
        <div className="max-w-4xl mx-auto">
          <div className="h-64 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 animate-pulse" />
        </div>
      </section>
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <StatsSection />
      <FeaturedAnnouncements />
      <CategoryNav />
      <BlogGrid />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
