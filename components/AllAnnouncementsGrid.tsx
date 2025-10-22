import { getAllAnnouncements } from "@/lib/announcements";
import AllAnnouncementsGridClient from "./AllAnnouncementsGrid.client";

export default function AllAnnouncementsGrid() {
  const announcements = getAllAnnouncements();

  return <AllAnnouncementsGridClient announcements={announcements} />;
}
