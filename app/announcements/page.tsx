import SearchBar from "@/components/SearchBar";
import AllAnnouncementsGrid from "@/components/AllAnnouncementsGrid";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Announcements | Santa Maria Municipal",
  description:
    "Browse all announcements, updates, and news from Santa Maria Municipal Government.",
};

export default function AnnouncementsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section for Announcements Page */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="heading-xl text-white mb-4">All Announcements</h1>
          <p className="body-lg text-white/90 max-w-2xl mx-auto">
            Stay up to date with the latest news, updates, and important
            announcements from Santa Maria Municipal Government.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <SearchBar />

      {/* All Announcements Grid with Pagination */}
      <AllAnnouncementsGrid />

      {/* Footer */}
      <Footer />
    </main>
  );
}
