"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "./FieldLabel";
import type { PostFormData } from "../types";
import { getCharCount } from "../utils";

interface SEOSettingsCardProps {
  metaTitle: string;
  metaDescription: string;
  onInputChange: (field: keyof PostFormData, value: string | string[]) => void;
}

/**
 * SEO settings card for search engine optimization
 */
export function SEOSettingsCard({
  metaTitle,
  metaDescription,
  onInputChange,
}: SEOSettingsCardProps) {
  const metaDescCount = getCharCount(metaDescription, 160);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Search Engine Settings</CardTitle>
        <CardDescription>
          Help people find your post on Google and other search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <FieldLabel tooltip="This is the title that shows up in Google search results. If left empty, we'll use your post title.">
            Search Result Title
          </FieldLabel>
          <Input
            placeholder="Custom title for search results (optional)..."
            value={metaTitle}
            onChange={(e) => onInputChange("metaTitle", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel tooltip="This short description appears under your title in Google search results. Make it interesting so people click on your post!">
              Search Result Description
            </FieldLabel>
            <span className={`text-xs font-medium ${metaDescCount.color}`}>
              {metaDescCount.count}/160
            </span>
          </div>
          <Textarea
            placeholder="Write a short description for search results..."
            value={metaDescription}
            onChange={(e) => onInputChange("metaDescription", e.target.value)}
            className="resize-none h-20"
            maxLength={160}
          />
        </div>
      </CardContent>
    </Card>
  );
}
