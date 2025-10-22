import { notFound } from "next/navigation";
import { getAnnouncementById, getAllAnnouncements } from "@/lib/announcements";
import AnnouncementDetail from "@/components/AnnouncementDetail";

export async function generateStaticParams() {
  const announcements = getAllAnnouncements();
  return announcements.map((announcement) => ({
    id: announcement.id,
  }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  const announcement = getAnnouncementById(id);

  if (!announcement) {
    return {
      title: "Announcement Not Found",
    };
  }

  return {
    title: `${announcement.title} | Santa Maria Municipal`,
    description: announcement.excerpt,
  };
}

export default function AnnouncementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const announcement = getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return <AnnouncementDetail announcement={announcement} />;
}
