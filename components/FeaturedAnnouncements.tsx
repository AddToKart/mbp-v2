import { getAllAnnouncements } from "@/lib/announcements";
import FeaturedAnnouncementsClient from "./FeaturedAnnouncements.client";

export default function FeaturedAnnouncements() {
  const announcements = getAllAnnouncements().slice(0, 3);

  return <FeaturedAnnouncementsClient announcements={announcements} />;
}
