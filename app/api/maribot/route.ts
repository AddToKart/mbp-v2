import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchPostSummaries } from "@/lib/posts";

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
  envThinkingBudget !== null ? envThinkingBudget : isThinkingModel ? 256 : null;

const parsedRetryEnv = Number(process.env.GEMINI_MAX_RETRIES);
const GEMINI_MAX_RETRIES = Number.isFinite(parsedRetryEnv)
  ? Math.min(3, Math.max(0, Math.floor(parsedRetryEnv)))
  : 1;
const BASE_RETRY_DELAY_MS = 1500;
const MAX_HISTORY_ITEMS = 8;

const historySchema = z
  .array(
    z.object({
      role: z.enum(["user", "bot"]),
      text: z.string(),
    })
  )
  .max(20)
  .optional();

const requestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  history: historySchema,
});

const BASE_SYSTEM_PROMPT = `You are MariBot, the friendly, witty, and helpful virtual assistant for Santa Maria Municipality. Your goal is to assist citizens with municipal services, announcements, and general inquiries.

**Language & Tone:**
- **Adaptive Language:** You MUST adapt to the user's language.
    - If the user speaks **Tagalog**, reply in **Tagalog**.
    - If the user speaks **English**, reply in **English**.
    - If the user speaks **Taglish**, reply in **Taglish**.
- **Personality:** Friendly, approachable, professional, and slightly witty. You are a helpful neighbor.
- **Conciseness:** Keep responses concise (2-3 sentences) unless a detailed explanation is requested.

**Capabilities:**
- Answer questions about recent announcements and events (using the provided context).
- Guide users to municipal services.
- If you don't know something, politely suggest contacting the municipal office directly.
- **NEVER** make up facts. If the information is not in your context, say you don't know.

**Context (Recent Announcements):**
`;

const SYSTEM_ACK =
  "Understood! I'm MariBot, ready to assist in English or Tagalog. I have the latest municipal updates. How can I help you today?";

function extractModelReply(data: GeminiResponse | undefined): string | null {
  if (!data?.candidates?.length) {
    return null;
  }

  for (const candidate of data.candidates) {
    const parts = candidate.content?.parts;
    if (!Array.isArray(parts) || parts.length === 0) {
      continue;
    }

    const textSegments = parts
      .map((part) => {
        if (typeof part?.text !== "string" || !part.text.trim()) {
          return null;
        }

        // Gemini 2.5 models prepend "thinking" parts. Skip them.
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

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini integration is not configured." },
      { status: 500 }
    );
  }

  let parsedBody: z.infer<typeof requestSchema>;
  try {
    const json = await request.json();
    parsedBody = requestSchema.parse(json);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Fetch latest posts for context
  let contextString = "No recent announcements available.";
  try {
    const posts = await fetchPostSummaries(5);
    if (posts.length > 0) {
      contextString = posts
        .map(
          (p) =>
            `- [${p.date}] ${p.title} (${p.category}): ${p.excerpt}`
        )
        .join("\n");
    }
  } catch (error) {
    console.error("Failed to fetch posts for MariBot context:", error);
  }

  const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n${contextString}`;

  const trimmedHistory = (parsedBody.history ?? []).slice(-MAX_HISTORY_ITEMS);
  const conversation = trimmedHistory.map((entry) => ({
    role: entry.role === "user" ? "user" : "model",
    parts: [{ text: entry.text.slice(0, 4000) }],
  }));

  const contents = [
    {
      role: "user",
      parts: [{ text: fullSystemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: SYSTEM_ACK }],
    },
    ...conversation,
    {
      role: "user",
      parts: [{ text: parsedBody.message }],
    },
  ];

  try {
    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40,
      ...(GEMINI_THINKING_BUDGET !== null
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

      if (process.env.NODE_ENV !== "production") {
        console.error(
          `[MariBot] Gemini API error ${response.status}:`,
          parsedDetails
        );
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

    const reply =
      extractModelReply(data) ??
      "I'm having trouble understanding that. Could you rephrase your question?";

    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error contacting Gemini";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
