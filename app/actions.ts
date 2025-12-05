"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidatePosts() {
  revalidateTag("posts");
  revalidatePath("/announcements");
  revalidatePath("/");
}
