// Post Editor Utility Functions

/**
 * Convert a string to URL-friendly slug
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Format scheduled date and time to human-readable label
 */
export const formatScheduleLabel = (
  date?: string,
  time?: string
): string | null => {
  if (!date) {
    return null;
  }
  const target = new Date(`${date}T${time ?? "09:00"}:00`);
  if (Number.isNaN(target.getTime())) {
    return `${date}${time ? ` ${time}` : ""}`;
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return formatter.format(target);
};

/**
 * Get character count with color indicator
 */
export const getCharCount = (
  text: string,
  max: number
): { count: number; color: string } => {
  const count = text.length;
  const percentage = (count / max) * 100;
  const color =
    percentage > 90
      ? "text-red-500"
      : percentage > 70
        ? "text-yellow-500"
        : "text-green-500";
  return { count, color };
};

/**
 * Calculate reading time in minutes
 */
export const calculateReadingTime = (content: string): number => {
  return Math.max(
    1,
    Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)
  );
};

/**
 * Count words in text
 */
export const countWords = (text: string): number => {
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
};

/**
 * Convert file to data URL
 */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read image"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
