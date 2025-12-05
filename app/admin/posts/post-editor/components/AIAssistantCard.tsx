"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SparklesIcon } from "@heroicons/react/24/outline";
import type { AssistantResult, LanguageOption } from "../types";

interface AIAssistantCardProps {
  assistantPrompt: string;
  setAssistantPrompt: (value: string) => void;
  assistantResult: AssistantResult | null;
  assistantError: string | null;
  isGeneratingAssistant: boolean;
  isAdjustingContent: "expand" | "shorten" | null;
  language: LanguageOption;
  setLanguage: (value: LanguageOption) => void;
  onGenerate: () => void;
  onAdjustContent: (mode: "expand" | "shorten") => void;
  onApplySuggestion: (field: "title" | "excerpt" | "content") => void;
  onApplyAll: () => void;
}

/**
 * AI Writing Assistant card component
 */
export function AIAssistantCard({
  assistantPrompt,
  setAssistantPrompt,
  assistantResult,
  assistantError,
  isGeneratingAssistant,
  isAdjustingContent,
  language,
  setLanguage,
  onGenerate,
  onAdjustContent,
  onApplySuggestion,
  onApplyAll,
}: AIAssistantCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary" />
          AI Writing Helper
        </CardTitle>
        <CardDescription>
          Let AI help you write your announcement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-muted-foreground">
            Language:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageOption)}
            className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Tagalog">Tagalog</option>
            <option value="English">English</option>
            <option value="Taglish">Taglish</option>
          </select>
        </div>
        <Textarea
          placeholder="Example: Draft a friendly reminder about the barangay clean-up drive this weekend."
          value={assistantPrompt}
          onChange={(e) => setAssistantPrompt(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onGenerate}
            disabled={isGeneratingAssistant || Boolean(isAdjustingContent)}
            className="gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {isGeneratingAssistant ? "Generating..." : "Generate Draft"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setAssistantPrompt(
                "Summarize the latest infrastructure update and highlight how residents can participate."
              )
            }
          >
            Use Template Prompt
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={Boolean(isAdjustingContent) || isGeneratingAssistant}
            onClick={() => onAdjustContent("expand")}
          >
            {isAdjustingContent === "expand"
              ? "Expanding..."
              : "Expand Content"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={Boolean(isAdjustingContent) || isGeneratingAssistant}
            onClick={() => onAdjustContent("shorten")}
          >
            {isAdjustingContent === "shorten"
              ? "Condensing..."
              : "Condense Content"}
          </Button>
          {assistantResult && (
            <Button type="button" variant="secondary" onClick={onApplyAll}>
              Apply All Suggestions
            </Button>
          )}
        </div>

        {assistantError && (
          <p className="text-sm text-destructive">{assistantError}</p>
        )}

        {assistantResult && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Suggested Title
                </p>
                <p className="font-medium text-foreground">
                  {assistantResult.title ?? "No title provided"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApplySuggestion("title")}
              >
                Use
              </Button>
            </div>

            <Separator />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Suggested Excerpt
                </p>
                <p className="text-sm text-foreground">
                  {assistantResult.excerpt ?? "No excerpt returned"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApplySuggestion("excerpt")}
              >
                Use
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Suggested Content
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {assistantResult.content ?? "No content provided"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApplySuggestion("content")}
                >
                  Use
                </Button>
              </div>
              {assistantResult.callToAction && (
                <p className="text-sm font-medium text-primary">
                  CTA: {assistantResult.callToAction}
                </p>
              )}
              {assistantResult.highlights &&
                assistantResult.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assistantResult.highlights.map((highlight) => (
                      <Badge key={highlight} variant="outline">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
