import { db } from "../db/client.js";

export const settingsKeyMap = {
  site_title: "siteTitle",
  site_tagline: "siteTagline",
  hero_headline: "heroHeadline",
  hero_subheadline: "heroSubheadline",
  contact_email: "contactEmail",
  contact_phone: "contactPhone",
  contact_address: "contactAddress",
} as const;

export type SettingsResponse = Record<
  (typeof settingsKeyMap)[keyof typeof settingsKeyMap],
  string
>;

export function loadSettings(): SettingsResponse {
  const rows = db
    .prepare(
      `SELECT key, value FROM site_settings WHERE key IN (${Object.keys(
        settingsKeyMap
      )
        .map(() => "?")
        .join(", ")})`
    )
    .all(...Object.keys(settingsKeyMap)) as Array<{
    key: keyof typeof settingsKeyMap;
    value: string;
  }>;

  const response = Object.values(settingsKeyMap).reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as SettingsResponse);

  rows.forEach((row) => {
    const mappedKey = settingsKeyMap[row.key];
    if (mappedKey) {
      response[mappedKey] = row.value;
    }
  });

  return response;
}

export function saveSetting(key: keyof typeof settingsKeyMap, value: string) {
  db.prepare(
    `INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`
  ).run(key, value);
}
