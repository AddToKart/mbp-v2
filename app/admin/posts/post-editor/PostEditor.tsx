"use client";

import { useMemo, useState } from "react";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeftIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

// Local imports
import type { PostEditorProps, PostFormData } from "./types";
import {
  useCategories,
  usePostForm,
  useAIAssistant,
  usePolicyWarnings,
  useRecommendedSchedule,
  usePostSave,
} from "./hooks";
import {
  PostDetailsCard,
  AIAssistantCard,
  ImageUploader,
  SEOSettingsCard,
  PublishSettingsCard,
  CategoryCard,
  TagsCard,
  PolicyChecklist,
  PostPreview,
} from "./components";

export default function PostEditor({ mode, postId }: PostEditorProps) {
  const { user, isAuthenticated } = useAuth();

  // Hooks
  const { categories, isLoadingCategories, categoryError } =
    useCategories(isAuthenticated);

  const {
    formData,
    setFormData,
    handleInputChange,
    isFetching,
    errors,
    validate,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
  } = usePostForm({
    mode,
    postId,
    isAuthenticated,
    userName: user?.name,
    categories,
  });

  const { policyWarnings, policyScore } = usePolicyWarnings({ formData });

  const recommendedSchedule = useRecommendedSchedule({
    category: formData.category,
    tagsLength: formData.tags.length,
  });

  const {
    isSaving,
    handleSave,
    handleForcePublish,
    imageError,
    setImageError,
    handleImageUpload,
  } = usePostSave({
    mode,
    postId,
    isAuthenticated,
    formData,
    setFormData,
    validate,
    policyWarnings,
  });

  const {
    assistantPrompt,
    setAssistantPrompt,
    assistantResult,
    assistantError,
    isGeneratingAssistant,
    isAdjustingContent,
    language,
    setLanguage,
    handleGenerateWithAssistant,
    handleAdjustContentLength,
    applyAiSuggestion,
    applyAllAiSuggestions,
  } = useAIAssistant({
    formData,
    handleInputChange,
  });

  // Local state
  const [isPreview, setIsPreview] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Derived values
  // Removed unused isAuthenticated memo - now using isAuthenticated from useAuth directly

  const selectedCategory = formData.category
    ? categories.find((cat) => cat.slug === formData.category)
    : undefined;

  // Markdown insertion helper
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "post-content"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + (selection || "") + suffix + after;

    handleInputChange("content", newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start + prefix.length + (selection.length || 0) + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleApplySuggestedSchedule = () => {
    if (!recommendedSchedule) {
      return;
    }
    handleInputChange("status", "scheduled");
    handleInputChange("scheduledDate", recommendedSchedule.date);
    handleInputChange("scheduledTime", recommendedSchedule.time);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading post details...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === "edit" ? "Edit Post" : "Create New Post"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "edit"
                ? "Update announcement details and republish when ready"
                : "Share announcements and updates with your community"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              console.log("Save Draft button clicked");
              await handleSave("draft");
            }}
            disabled={isSaving}
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            onClick={async () => {
              // Handle publish action
              console.log("Publish button clicked");
              await handleSave(mode === "create" ? "published" : undefined);
            }}
            disabled={isSaving}
            className="gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isSaving
              ? mode === "edit"
                ? "Saving..."
                : "Publishing..."
              : mode === "edit"
                ? "Save Changes"
                : "Publish Now"}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleForcePublish}
                  disabled={isSaving}
                  variant="destructive"
                  className="gap-2"
                >
                  <BoltIcon className="w-4 h-4" />
                  Force Publish
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Skip quality checks and publish immediately (use with caution)
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {!isPreview ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PostDetailsCard
                formData={formData}
                onInputChange={handleInputChange}
                errors={errors}
                isZenMode={isZenMode}
                setIsZenMode={setIsZenMode}
                onInsertMarkdown={insertMarkdown}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <AIAssistantCard
                assistantPrompt={assistantPrompt}
                setAssistantPrompt={setAssistantPrompt}
                assistantResult={assistantResult}
                assistantError={assistantError}
                isGeneratingAssistant={isGeneratingAssistant}
                isAdjustingContent={isAdjustingContent}
                language={language}
                setLanguage={setLanguage}
                onGenerate={handleGenerateWithAssistant}
                onAdjustContent={handleAdjustContentLength}
                onApplySuggestion={applyAiSuggestion}
                onApplyAll={applyAllAiSuggestions}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ImageUploader
                featuredImage={formData.featuredImage}
                onImageChange={(value) =>
                  setFormData((prev) => ({ ...prev, featuredImage: value }))
                }
                onImageUpload={handleImageUpload}
                imageError={imageError}
                validationError={errors.featuredImage}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <SEOSettingsCard
                metaTitle={formData.metaTitle}
                metaDescription={formData.metaDescription}
                onInputChange={handleInputChange}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-4 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PublishSettingsCard
                formData={formData}
                onInputChange={handleInputChange}
                recommendedSchedule={recommendedSchedule}
                onApplySuggestedSchedule={handleApplySuggestedSchedule}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <CategoryCard
                category={formData.category}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                categoryError={categoryError}
                categoryValidationError={errors.category}
                onCategoryChange={(value) =>
                  handleInputChange("category", value)
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TagsCard
                tags={formData.tags}
                tagInput={tagInput}
                onTagInputChange={setTagInput}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <PolicyChecklist
                policyWarnings={policyWarnings}
                policyScore={policyScore}
              />
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PostPreview
            formData={formData}
            selectedCategory={selectedCategory}
          />
        </motion.div>
      )}
    </div>
  );
}
