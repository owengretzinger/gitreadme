import { type ViewMode } from "~/components/view-mode-toggle";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { MarkdownDisplay } from "~/components/markdown-display";
import { cn } from "~/lib/utils";
import { GenerationState } from "~/hooks/use-readme-helpers/use-readme-stream";

interface GeneratedReadmeProps {
  content: string | null;
  generationState: GenerationState;
}

export function GeneratedReadme({
  content,
  generationState,
}: GeneratedReadmeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  const handleCopy = useCallback(() => {
    if (!content) return;
    void navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [content]);

  return (
    <MarkdownDisplay
      title="Generated README"
      description="Review and customize your generated README"
      content={content ?? ""}
      viewMode={viewMode}
      setViewMode={setViewMode}
      showViewModeToggle
      actions={[
        {
          icon: isCopied ? Check : Copy,
          onClick: handleCopy,
        },
      ]}
      className={cn(
        "min-h-[600px]",
        generationState === GenerationState.STREAMING && "border-primary",
      )}
      isGenerating={
        generationState !== GenerationState.NOT_STARTED &&
        generationState !== GenerationState.COMPLETED
      }
    />
  );
}
