import { getAllAnnouncements } from "@/lib/announcements";
import BlogGridClient from "./BlogGrid.client";

export default function BlogGrid() {
  const announcements = getAllAnnouncements().slice(0, 3);

  return <BlogGridClient announcements={announcements} />;
}
