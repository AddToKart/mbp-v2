// Post Editor Constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Re-export from shared types
export { MAX_TITLE_LENGTH, MAX_EXCERPT_LENGTH } from "@/types/shared";
