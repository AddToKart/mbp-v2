"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PostFormData, CategoryOption } from "../types";

interface PostPreviewProps {
  formData: PostFormData;
  selectedCategory: CategoryOption | undefined;
}

/**
 * Post preview component showing how the post will look
 */
export function PostPreview({ formData, selectedCategory }: PostPreviewProps) {
  return (
    <Card className="shadow-lg max-w-4xl mx-auto">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-4">
          {formData.featuredImage && (
            <img
              src={formData.featuredImage}
              alt={formData.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
          <div className="space-y-2">
            {formData.category && (
              <Badge variant="secondary" className="text-sm">
                {selectedCategory?.name ?? formData.category}
              </Badge>
            )}
            <h1 className="text-4xl font-bold text-foreground">
              {formData.title || "Untitled Post"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {formData.excerpt || "No excerpt provided"}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>By {formData.author}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">
            {formData.content || "No content yet..."}
          </p>
        </div>

        {formData.tags.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
