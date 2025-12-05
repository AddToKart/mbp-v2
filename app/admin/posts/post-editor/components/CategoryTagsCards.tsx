"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { CategoryOption } from "../types";

interface CategoryTagsCardsProps {
  category: string;
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  categoryError: string | null;
  categoryValidationError?: string;
  onCategoryChange: (value: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

/**
 * Category selection card
 */
export function CategoryCard({
  category,
  categories,
  isLoadingCategories,
  categoryError,
  categoryValidationError,
  onCategoryChange,
}: Omit<
  CategoryTagsCardsProps,
  "tags" | "tagInput" | "onTagInputChange" | "onAddTag" | "onRemoveTag"
>) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Category</CardTitle>
        <CardDescription>
          Choose what type of announcement this is
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`w-full h-10 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              categoryValidationError ? "border-destructive" : ""
            }`}
            disabled={isLoadingCategories}
          >
            <option value="" disabled>
              {isLoadingCategories
                ? "Loading categories..."
                : categoryError
                  ? "Unable to load categories"
                  : "Select category..."}
            </option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryValidationError && (
            <p className="text-sm text-destructive mt-1">
              {categoryValidationError}
            </p>
          )}
          {categoryError ? (
            <p className="text-sm text-destructive">{categoryError}</p>
          ) : (
            categories.length === 0 &&
            !isLoadingCategories && (
              <p className="text-sm text-muted-foreground">
                No categories found. Create one first.
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Tags management card
 */
export function TagsCard({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: Pick<
  CategoryTagsCardsProps,
  "tags" | "tagInput" | "onTagInputChange" | "onAddTag" | "onRemoveTag"
>) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Add keywords to help people find your post
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a tag and press Enter..."
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddTag();
              }
            }}
          />
          <Button size="icon" onClick={onAddTag} disabled={!tagInput.trim()}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
