import { type ViewMode } from "~/components/view-mode-toggle";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { MarkdownDisplay } from "~/components/markdown-display";

interface GeneratedReadmeProps {
  content: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function GeneratedReadme({
  content,
  viewMode,
  setViewMode,
}: GeneratedReadmeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!content) return;
    void navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [content]);

  if (!content) {
    return (
      <div className="text-center text-muted-foreground">
        Generate a README first
      </div>
    );
  }

  return (
    <MarkdownDisplay
      title="Generated README"
      description="Review and customize your generated README"
      content={content}
      viewMode={viewMode}
      setViewMode={setViewMode}
      showViewModeToggle
      actions={[
        {
          icon: isCopied ? Check : Copy,
          onClick: handleCopy,
        },
      ]}
      className="min-h-[600px]"
    />
  );
} 