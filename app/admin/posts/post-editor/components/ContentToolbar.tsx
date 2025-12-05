"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ListBulletIcon,
  LinkIcon,
  CodeBracketIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";

interface ContentToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string) => void;
}

/**
 * Markdown formatting toolbar for the content editor
 */
export function ContentToolbar({ onInsertMarkdown }: ContentToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border border-b-0 border-border rounded-t-md bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 font-bold"
        onClick={() => onInsertMarkdown("**", "**")}
        title="Bold"
      >
        B
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 italic"
        onClick={() => onInsertMarkdown("*", "*")}
        title="Italic"
      >
        I
      </Button>
      <Separator orientation="vertical" className="h-4 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 font-bold"
        onClick={() => onInsertMarkdown("## ")}
        title="Heading 2"
      >
        H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 font-bold"
        onClick={() => onInsertMarkdown("### ")}
        title="Heading 3"
      >
        H3
      </Button>
      <Separator orientation="vertical" className="h-4 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onInsertMarkdown("- ")}
        title="Bullet List"
      >
        <ListBulletIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onInsertMarkdown("1. ")}
        title="Numbered List"
      >
        <QueueListIcon className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-4 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onInsertMarkdown("> ")}
        title="Quote"
      >
        "
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onInsertMarkdown("```\n", "\n```")}
        title="Code Block"
      >
        <CodeBracketIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onInsertMarkdown("[", "](url)")}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
