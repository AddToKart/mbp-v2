"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ImageUploaderProps {
  featuredImage: string;
  onImageChange: (value: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageError: string | null;
  validationError?: string;
}

/**
 * Featured image upload component
 */
export function ImageUploader({
  featuredImage,
  onImageChange,
  onImageUpload,
  imageError,
  validationError,
}: ImageUploaderProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PhotoIcon className="w-5 h-5 text-primary" />
          Cover Image
        </CardTitle>
        <CardDescription>
          Add an eye-catching image for your post
        </CardDescription>
      </CardHeader>
      <CardContent>
        {featuredImage ? (
          <div className="relative group">
            <img
              src={featuredImage}
              alt="Featured"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onImageChange("")}
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <PhotoIcon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG or WebP (MAX. 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onImageUpload}
            />
          </label>
        )}
        {imageError && (
          <p className="text-sm text-destructive mt-2 text-center">
            {imageError}
          </p>
        )}
        {validationError && (
          <p className="text-sm text-destructive mt-2 text-center">
            {validationError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
