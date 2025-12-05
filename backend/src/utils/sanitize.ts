/**
 * Input sanitization utilities for preventing XSS and other injection attacks
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strips all HTML tags from a string (for plain text fields)
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Sanitizes markdown content - allows safe markdown but strips dangerous patterns
 * This is a basic sanitizer; for production, consider using a library like DOMPurify
 */
export function sanitizeMarkdown(input: string): string {
  return (
    input
      // Remove potential script injections
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove javascript: URLs
      .replace(/javascript:/gi, "")
      // Remove data: URLs that could be dangerous (except images)
      .replace(/data:(?!image\/)[^;]+;/gi, "")
      // Remove event handlers
      .replace(/\bon\w+\s*=/gi, "")
      // Remove iframe, object, embed tags
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "")
      .replace(/<embed[^>]*\/?>/gi, "")
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "")
      .replace(/<input[^>]*\/?>/gi, "")
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, "")
      // Remove style tags (could contain expressions)
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Trim excessive whitespace
      .trim()
  );
}

/**
 * Sanitizes a URL to prevent javascript: and data: injection
 */
export function sanitizeUrl(input: string): string | null {
  const trimmed = input.trim();

  // Allow relative URLs
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  // Allow http and https URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      // Only allow http/https protocols
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString();
      }
    } catch {
      return null;
    }
  }

  // Allow data:image URLs (for base64 images)
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Sanitizes a slug to only allow safe characters
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validates and sanitizes an email address
 */
export function sanitizeEmail(input: string): string {
  return input.toLowerCase().trim();
}

/**
 * Truncates a string to a maximum length, adding ellipsis if needed
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength - 3) + "...";
}

/**
 * Removes null bytes and other control characters that could cause issues
 */
export function removeControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Combined sanitization for user-provided text fields
 */
export function sanitizeText(
  input: string,
  options: { maxLength?: number; allowHtml?: boolean } = {}
): string {
  const { maxLength = 10000, allowHtml = false } = options;

  let result = removeControlChars(input);

  if (!allowHtml) {
    result = stripHtml(result);
  }

  if (maxLength && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result.trim();
}
