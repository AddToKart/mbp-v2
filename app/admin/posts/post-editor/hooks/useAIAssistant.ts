"use client";

import { useState } from "react";
import type { AssistantResult, PostFormData, LanguageOption } from "../types";

interface UseAIAssistantProps {
  formData: PostFormData;
  handleInputChange: (
    field: keyof PostFormData,
    value: string | string[]
  ) => void;
}

interface UseAIAssistantReturn {
  assistantPrompt: string;
  setAssistantPrompt: (value: string) => void;
  assistantResult: AssistantResult | null;
  setAssistantResult: (value: AssistantResult | null) => void;
  assistantError: string | null;
  setAssistantError: (value: string | null) => void;
  isGeneratingAssistant: boolean;
  isAdjustingContent: "expand" | "shorten" | null;
  language: LanguageOption;
  setLanguage: (value: LanguageOption) => void;
  handleGenerateWithAssistant: () => Promise<void>;
  handleAdjustContentLength: (mode: "expand" | "shorten") => Promise<void>;
  applyAiSuggestion: (field: "title" | "excerpt" | "content") => void;
  applyAllAiSuggestions: () => void;
}

export function useAIAssistant({
  formData,
  handleInputChange,
}: UseAIAssistantProps): UseAIAssistantReturn {
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantResult, setAssistantResult] =
    useState<AssistantResult | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [isGeneratingAssistant, setIsGeneratingAssistant] = useState(false);
  const [isAdjustingContent, setIsAdjustingContent] = useState<
    "expand" | "shorten" | null
  >(null);
  const [language, setLanguage] = useState<LanguageOption>("Tagalog");

  const handleGenerateWithAssistant = async () => {
    if (!assistantPrompt.trim()) {
      setAssistantError("Describe what you want the AI to draft.");
      return;
    }

    setIsGeneratingAssistant(true);
    setAssistantError(null);

    try {
      const response = await fetch("/api/posts/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructions: assistantPrompt.trim(),
          language,
          context: {
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            tags: formData.tags,
            tone: formData.status === "published" ? "formal" : "friendly",
            audience: "Santa Maria residents",
          },
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        suggestions?: AssistantResult;
      };

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to fetch AI suggestions");
      }

      if (!data?.suggestions) {
        throw new Error("Assistant did not return any suggestions");
      }

      setAssistantResult(data.suggestions);
    } catch (assistantIssue) {
      const message =
        assistantIssue instanceof Error
          ? assistantIssue.message
          : "Unable to reach the writing assistant";
      setAssistantError(message);
    } finally {
      setIsGeneratingAssistant(false);
    }
  };

  const handleAdjustContentLength = async (mode: "expand" | "shorten") => {
    if (!formData.content.trim()) {
      setAssistantError("Add some content before using expand or shorten.");
      return;
    }

    setIsAdjustingContent(mode);
    setAssistantError(null);

    const targetRange = mode === "expand" ? "260-320" : "120-150";
    const instruction =
      mode === "expand"
        ? `Expand the municipal announcement content below to roughly ${targetRange} words. Keep the tone civic-focused, add helpful details, and avoid making up specific statistics if they are not provided.`
        : `Condense the municipal announcement content below to roughly ${targetRange} words. Preserve key facts, dates, and calls to action while keeping the tone warm and citizen-friendly.`;

    try {
      const response = await fetch("/api/posts/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "rewrite",
          language,
          instructions: `${instruction}\n\nCONTENT TO ${mode.toUpperCase()}:\n${formData.content}`,
          context: {
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            tags: formData.tags,
            tone: formData.status === "published" ? "formal" : "friendly",
            audience: "Santa Maria residents",
          },
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        rewrite?: string;
        suggestions?: AssistantResult;
      };

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to adjust content length");
      }

      const nextContent = (data.rewrite ?? data.suggestions?.content)?.trim();

      if (!nextContent) {
        throw new Error("Assistant did not return updated content");
      }

      const callToAction = data.suggestions?.callToAction?.trim();
      const composed = callToAction
        ? `${nextContent}\n\n${callToAction}`
        : nextContent;

      handleInputChange("content", composed);
      if (data.suggestions) {
        setAssistantResult(data.suggestions);
      }
    } catch (adjustError) {
      const message =
        adjustError instanceof Error
          ? adjustError.message
          : "Unable to adjust content length";
      setAssistantError(message);
    } finally {
      setIsAdjustingContent(null);
    }
  };

  const applyAiSuggestion = (field: "title" | "excerpt" | "content") => {
    if (!assistantResult) {
      return;
    }
    const nextValue = assistantResult[field];
    if (!nextValue) {
      return;
    }

    if (field === "content") {
      const composed = assistantResult.callToAction
        ? `${nextValue.trim()}\n\n${assistantResult.callToAction.trim()}`
        : nextValue.trim();
      handleInputChange("content", composed);
      return;
    }

    handleInputChange(field, nextValue.trim());
  };

  const applyAllAiSuggestions = () => {
    if (!assistantResult) {
      return;
    }
    applyAiSuggestion("title");
    applyAiSuggestion("excerpt");
    applyAiSuggestion("content");
  };

  return {
    assistantPrompt,
    setAssistantPrompt,
    assistantResult,
    setAssistantResult,
    assistantError,
    setAssistantError,
    isGeneratingAssistant,
    isAdjustingContent,
    language,
    setLanguage,
    handleGenerateWithAssistant,
    handleAdjustContentLength,
    applyAiSuggestion,
    applyAllAiSuggestions,
  };
}
