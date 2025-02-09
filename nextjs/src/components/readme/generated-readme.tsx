import { type ViewMode } from "~/components/view-mode-toggle";
import { Copy, Check, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { MarkdownDisplay } from "~/components/markdown-display";
import { cn } from "~/lib/utils";
import { GenerationState } from "~/hooks/use-readme-form";

interface GeneratedReadmeProps {
  content: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  generationState: GenerationState;
}

export function GeneratedReadme({
  content,
  viewMode,
  setViewMode,
  generationState,
}: GeneratedReadmeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!content) return;
    void navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [content]);

  if (!content && generationState === GenerationState.IDLE) {
    return (
      <div className="text-center text-muted-foreground">
        Generate a README first
      </div>
    );
  }

  const getLoadingContent = () => {
    switch (generationState) {
      case GenerationState.CONTACTING_SERVER:
        return {
          title: "Contacting server...",
          description: "Establishing connection to generate your README",
        };
      case GenerationState.PACKING_REPOSITORY:
        return {
          title: "Analyzing repository...",
          description: "This may take a moment depending on the repository size",
        };
      case GenerationState.WAITING_FOR_AI:
        return {
          title: "Preparing response...",
          description: "The AI is generating your README",
        };
      default:
        return null;
    }
  };

  const loadingContent = getLoadingContent();
  if (loadingContent) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="flex flex-col items-center gap-1">
          <p className="font-medium">{loadingContent.title}</p>
          <p className="text-sm">{loadingContent.description}</p>
        </div>
      </div>
    );
  }

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
      className={cn("min-h-[600px]", generationState === GenerationState.STREAMING && "border-primary")}
      isGenerating={generationState !== GenerationState.IDLE}
    />
  );
}
