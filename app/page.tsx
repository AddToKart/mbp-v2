import Hero from "@/components/Hero";
import FeaturedAnnouncements from "@/components/FeaturedAnnouncements";
import CategoryNav from "@/components/CategoryNav";
import StatsSection from "@/components/StatsSection";
import SearchBar from "@/components/SearchBar";
import BlogGrid from "@/components/BlogGrid";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <StatsSection />
      <FeaturedAnnouncements />
      <CategoryNav />
      <SearchBar />
      <BlogGrid />
      <NewsletterSection />
      <Footer />
    </main>
  );
}