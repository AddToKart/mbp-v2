import { NextResponse } from "next/server";
import { z } from "zod";

const GEMINI_API_BASE = (
  process.env.GEMINI_API_BASE?.trim() ??
  "https://generativelanguage.googleapis.com"
).replace(/\/$/, "");
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION?.trim() ?? "v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() ?? "gemini-2.0-flash-exp";
const GEMINI_ENDPOINT = `${GEMINI_API_BASE}/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;

type GeminiPart = {
  text?: string;
  thought?: unknown;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

function parseThinkingBudget(value?: string | null): number | null {
  if (!value) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const clamped = Math.max(-1, Math.min(8192, Math.floor(numeric)));
  return clamped;
}

const isThinkingModel = /2\.5/.test(GEMINI_MODEL);
const envThinkingBudget = parseThinkingBudget(
  process.env.GEMINI_THINKING_BUDGET
);
const GEMINI_THINKING_BUDGET =
  envThinkingBudget !== null ? envThinkingBudget : isThinkingModel ? 512 : null;

const parsedRetryEnv = Number(process.env.GEMINI_MAX_RETRIES);
const GEMINI_MAX_RETRIES = Number.isFinite(parsedRetryEnv)
  ? Math.min(3, Math.max(0, Math.floor(parsedRetryEnv)))
  : 1;
const BASE_RETRY_DELAY_MS = 1500;

const requestSchema = z.object({
  instructions: z
    .string()
    .min(10, "Please provide at least 10 characters of guidance")
    .max(50000, "Let's keep the prompt under 50000 characters"),
  context: z
    .object({
      title: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).max(12).optional(),
      tone: z.enum(["formal", "friendly", "urgent", "celebratory"]).optional(),
      audience: z.string().optional(),
    })
    .optional(),
  mode: z.enum(["draft", "rewrite"]).optional(),
  language: z.enum(["English", "Tagalog", "Taglish"]).optional(),
});

function parseRetryDelayMs(retryAfter?: string | null) {
  if (!retryAfter) {
    return BASE_RETRY_DELAY_MS;
  }

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(5000, Math.max(500, seconds * 1000));
  }

  const retryDate = new Date(retryAfter);
  if (!Number.isNaN(retryDate.getTime())) {
    const diff = retryDate.getTime() - Date.now();
    return Math.min(5000, Math.max(500, diff));
  }

  return BASE_RETRY_DELAY_MS;
}

async function postToGeminiWithRetry(
  body: string,
  apiKey: string,
  attempt = 0
): Promise<Response> {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (response.status === 429 && attempt < GEMINI_MAX_RETRIES) {
    const delay = parseRetryDelayMs(response.headers.get("retry-after"));
    await new Promise((resolve) => setTimeout(resolve, delay));
    return postToGeminiWithRetry(body, apiKey, attempt + 1);
  }

  return response;
}

const SYSTEM_INSTRUCTIONS = `You are Mara, an editorial AI assistant helping the Santa Maria Municipality communications team craft clear, citizen-friendly announcements.

Requirements:
- Tailor the writing to Philippine local government announcements.
- Keep the tone professional yet warm and community-focused.
- Return STRICT JSON with the shape:
  {
    "title": string,
    "excerpt": string,
    "content": string,
    "callToAction": string,
    "highlights": string[]
  }
- The content should be 2-3 medium paragraphs (approx 180-260 words) and reference the provided context when relevant.
- Never include markdown, code fences, or explanations outside of the JSON object.
- If required details are missing, make sensible assumptions but keep them general (no fabricated statistics).
- Call-to-action sentences should be actionable and citizen-focused.
`;

const DEFAULT_RESPONSE = {
  title: "Community Update",
  excerpt: "Stay informed with the latest news from Santa Maria Municipality.",
  content:
    "We're preparing new information for this update. Please check back shortly or reach out to the municipal public information office for immediate assistance.",
  callToAction: "Contact the municipal information office for more details.",
  highlights: ["Information pending"],
};

function extractJsonCandidate(rawText: string) {
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in Gemini response");
  }
  const jsonSlice = rawText.slice(start, end + 1);
  return JSON.parse(jsonSlice);
}

function extractTextParts(data: GeminiResponse | undefined): string | null {
  if (!data?.candidates?.length) {
    return null;
  }

  for (const candidate of data.candidates) {
    const parts = candidate.content?.parts;
    if (!Array.isArray(parts)) {
      continue;
    }

    const textSegments = parts
      .map((part) => {
        if (typeof part?.text !== "string") {
          return null;
        }

        if ("thought" in part && part.thought) {
          return null;
        }

        return part.text.trim();
      })
      .filter((segment): segment is string => Boolean(segment));

    if (textSegments.length > 0) {
      return textSegments.join("\n\n");
    }
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini integration is not configured." },
      { status: 500 }
    );
  }

  let payload: z.infer<typeof requestSchema>;
  try {
    const body = await request.json();
    payload = requestSchema.parse(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { instructions, context, mode, language = "Tagalog" } = payload;
  const contextSummary = JSON.stringify(context ?? {});

  const isRewrite = mode === "rewrite";

  let languageDirective = "";
  switch (language) {
    case "English":
      languageDirective =
        "IMPORTANT: Write strictly in English. Do not use Tagalog words unless they are proper nouns (like place names). Maintain a professional yet community-friendly tone suitable for an English-speaking audience in the Philippines.";
      break;
    case "Tagalog":
      languageDirective =
        "IMPORTANT: Write strictly in Tagalog. Use formal but accessible Filipino suitable for official municipal announcements. Avoid deep/archaic Tagalog words; use terms common in everyday usage.";
      break;
    case "Taglish":
      languageDirective =
        "IMPORTANT: Write in Taglish (a natural mix of English and Tagalog). This should sound like a friendly, modern social media update. Use English for technical terms and Tagalog for relational/emotional connection.";
      break;
    default:
      languageDirective = `IMPORTANT: Write strictly in ${language}.`;
  }

  const userPrompt = isRewrite
    ? `You are Mara, a municipal editorial assistant. ${instructions}\n\nContext (JSON): ${contextSummary}.\n${languageDirective}\nProvide the rewritten content ONLY as plain text with no JSON or commentary.`
    : `${SYSTEM_INSTRUCTIONS}\n${languageDirective}\nContext: ${contextSummary}\nWriter instructions: ${instructions}`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: userPrompt,
        },
      ],
    },
  ];

  try {
    const generationConfig = {
      temperature: isRewrite ? 0.4 : 0.65,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: isRewrite ? 2000 : 4000,
      responseMimeType: isRewrite ? "text/plain" : "application/json",
      ...(GEMINI_THINKING_BUDGET !== null && !isRewrite
        ? { thinkingConfig: { thinkingBudget: GEMINI_THINKING_BUDGET } }
        : {}),
    };

    const payload = JSON.stringify({
      contents,
      generationConfig,
    });

    const response = await postToGeminiWithRetry(payload, apiKey);

    if (!response.ok) {
      const errorBody = await response.text();
      let parsedDetails: unknown = errorBody;
      try {
        parsedDetails = JSON.parse(errorBody);
      } catch {
        parsedDetails = errorBody || "Unknown Gemini error";
      }

      const retryAfter = response.headers.get("retry-after");
      const passthroughStatuses = new Set([401, 403, 404, 409, 429, 503]);
      const status = passthroughStatuses.has(response.status)
        ? response.status
        : 502;

      return NextResponse.json(
        {
          error: `Gemini responded with ${response.status}`,
          details: parsedDetails,
          model: GEMINI_MODEL,
          retryAfter,
        },
        { status }
      );
    }

    const data = (await response.json()) as GeminiResponse;

    const rawText = extractTextParts(data) ?? "";
    console.log("[Gemini] Raw text:", rawText);

    if (isRewrite) {
      if (!rawText) {
        throw new Error("Gemini did not return rewritten content");
      }
      return NextResponse.json({ rewrite: rawText.trim() });
    }

    let structured = DEFAULT_RESPONSE;
    if (rawText) {
      try {
        const parsed = extractJsonCandidate(rawText);
        structured = {
          title:
            typeof parsed.title === "string"
              ? parsed.title.trim()
              : DEFAULT_RESPONSE.title,
          excerpt:
            typeof parsed.excerpt === "string"
              ? parsed.excerpt.trim()
              : DEFAULT_RESPONSE.excerpt,
          content:
            typeof parsed.content === "string"
              ? parsed.content.trim()
              : DEFAULT_RESPONSE.content,
          callToAction:
            typeof parsed.callToAction === "string"
              ? parsed.callToAction.trim()
              : DEFAULT_RESPONSE.callToAction,
          highlights: Array.isArray(parsed.highlights)
            ? parsed.highlights
              .map((item: unknown) =>
                typeof item === "string" ? item.trim() : null
              )
              .filter(
                (item: string | null): item is string =>
                  typeof item === "string" && item.length > 0
              )
            : DEFAULT_RESPONSE.highlights,
        };
      } catch (parseError) {
        console.error("[Gemini] JSON parse error:", parseError);
        console.error("[Gemini] Failed text:", rawText);
        structured = DEFAULT_RESPONSE;
      }
    }

    return NextResponse.json({ suggestions: structured });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error contacting Gemini";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
