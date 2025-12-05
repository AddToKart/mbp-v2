"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DocumentTextIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import { FieldLabel } from "./FieldLabel";
import { ContentToolbar } from "./ContentToolbar";
import type { PostFormData } from "../types";
import { getCharCount, calculateReadingTime } from "../utils";
import { MAX_TITLE_LENGTH, MAX_EXCERPT_LENGTH } from "../constants";

interface PostDetailsCardProps {
  formData: PostFormData;
  onInputChange: (field: keyof PostFormData, value: string | string[]) => void;
  errors: Record<string, string | undefined>;
  isZenMode: boolean;
  setIsZenMode: (value: boolean) => void;
  onInsertMarkdown: (prefix: string, suffix?: string) => void;
}

/**
 * Main post details card with title, slug, excerpt, and content
 */
export function PostDetailsCard({
  formData,
  onInputChange,
  errors,
  isZenMode,
  setIsZenMode,
  onInsertMarkdown,
}: PostDetailsCardProps) {
  const titleCount = getCharCount(formData.title, MAX_TITLE_LENGTH);
  const excerptCount = getCharCount(formData.excerpt, MAX_EXCERPT_LENGTH);
  const readingTime = calculateReadingTime(formData.content);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-primary" />
          Post Details
        </CardTitle>
        <CardDescription>
          Create compelling content for your audience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel
              tooltip="The main headline of your post. Make it catchy and clear so people know what your announcement is about."
              required
            >
              Title
            </FieldLabel>
            <span className={`text-xs font-medium ${titleCount.color}`}>
              {titleCount.count}/{MAX_TITLE_LENGTH}
            </span>
          </div>
          <Input
            placeholder="Enter an engaging title..."
            value={formData.title}
            onChange={(e) => onInputChange("title", e.target.value)}
            className={`text-lg font-semibold h-12 ${
              errors.title ? "border-destructive" : ""
            }`}
            maxLength={MAX_TITLE_LENGTH}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <FieldLabel tooltip="This is the web address where people can find your post. It's created automatically from your title, but you can change it if you want.">
            Post Link (Web Address)
          </FieldLabel>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/posts/</span>
            <Input
              placeholder="auto-generated-slug"
              value={formData.slug}
              onChange={(e) => onInputChange("slug", e.target.value)}
              className={`flex-1 ${errors.slug ? "border-destructive" : ""}`}
            />
          </div>
          {errors.slug && (
            <p className="text-sm text-destructive mt-1">{errors.slug}</p>
          )}
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel
              tooltip="A quick preview of your post (2-3 sentences). This shows up on the homepage and when people share your post on Facebook or other sites."
              required
            >
              Short Summary
            </FieldLabel>
            <span className={`text-xs font-medium ${excerptCount.color}`}>
              {excerptCount.count}/{MAX_EXCERPT_LENGTH}
            </span>
          </div>
          <Textarea
            placeholder="Write a brief summary of your post..."
            value={formData.excerpt}
            onChange={(e) => onInputChange("excerpt", e.target.value)}
            className={`resize-none h-20 ${
              errors.excerpt ? "border-destructive" : ""
            }`}
            maxLength={MAX_EXCERPT_LENGTH}
          />
          {errors.excerpt && (
            <p className="text-sm text-destructive mt-1">{errors.excerpt}</p>
          )}
        </div>

        <Separator />

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel
              tooltip="This is where you write your full announcement. Use the formatting buttons above to add headings, bold text, lists, and more."
              required
            >
              Main Content
            </FieldLabel>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {readingTime} min read
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsZenMode(!isZenMode)}
                    >
                      {isZenMode ? (
                        <ArrowsPointingInIcon className="w-4 h-4" />
                      ) : (
                        <ArrowsPointingOutIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isZenMode
                      ? "Exit Focus Mode"
                      : "Focus Mode - Write without distractions"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Text Formatting Toolbar */}
          <ContentToolbar onInsertMarkdown={onInsertMarkdown} />

          <div
            className={
              isZenMode
                ? "fixed inset-0 z-50 bg-background p-6 flex flex-col"
                : ""
            }
          >
            {isZenMode && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Focus Mode</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsZenMode(false)}
                >
                  <ArrowsPointingInIcon className="w-5 h-5 mr-2" />
                  Exit Focus Mode
                </Button>
              </div>
            )}
            <Textarea
              id="post-content"
              placeholder="Write your post content here... (Markdown supported)"
              value={formData.content}
              onChange={(e) => onInputChange("content", e.target.value)}
              className={`resize-none min-h-[400px] font-mono text-sm rounded-t-none ${
                isZenMode
                  ? "flex-1 h-full border-none focus-visible:ring-0 text-lg max-w-3xl mx-auto"
                  : ""
              } ${errors.content ? "border-destructive" : ""}`}
            />
          </div>
          {errors.content && (
            <p className="text-sm text-destructive mt-1">{errors.content}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: Use the formatting buttons above to style your text with bold,
            headings, lists, and links.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
