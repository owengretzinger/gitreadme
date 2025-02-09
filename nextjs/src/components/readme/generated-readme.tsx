import { ViewModeToggle, type ViewMode } from "~/components/view-mode-toggle";
import { ContentView } from "~/components/content-view";
import { ActionButton } from "~/components/action-button";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

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

  const handleCopy = useCallback(async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [content]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Generated README</h3>
          <p className="text-sm text-muted-foreground">
            Review and customize your generated README
          </p>
        </div>
        {content && (
          <div className="flex items-center gap-2">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            <ActionButton
              onClick={handleCopy}
              icon={
                isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
            />
          </div>
        )}
      </div>
      {content ? (
        <ContentView
          content={content}
          viewMode={viewMode}
          className="min-h-[600px]"
        />
      ) : (
        <div className="text-center text-muted-foreground">
          Generate a README first
        </div>
      )}
    </div>
  );
} 