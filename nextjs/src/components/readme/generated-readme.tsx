import { type ViewMode } from "~/components/view-mode-toggle";
import { Copy, Check, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { MarkdownDisplay } from "~/components/markdown-display";
import { cn } from "~/lib/utils";
import { GenerationState } from "~/hooks/use-readme-form";

const GENERATION_STEPS = [
  {
    id: "server",
    state: GenerationState.CONTACTING_SERVER,
    label: "Contacting server",
  },
  {
    id: "packing",
    state: GenerationState.PACKING_REPOSITORY,
    label: "Packing repository",
  },
  {
    id: "ai",
    state: GenerationState.WAITING_FOR_AI,
    label: "Sending to AI",
  },
  {
    id: "streaming",
    state: GenerationState.STREAMING,
    label: "Streaming response",
  },
] as const;

function LoadingSteps({ currentState }: { currentState: GenerationState }) {
  // Find the index of the current step
  const currentStepIndex = GENERATION_STEPS.findIndex(
    (step) => step.state === currentState,
  );
  const translateY = -currentStepIndex * 24;

  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center">
      <div
        className="relative flex flex-col items-start gap-3 transition-all duration-500 ease-in-out"
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        {GENERATION_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3",
                "text-muted-foreground/60",
                {
                  "text-muted-foreground": isCurrent,
                  "text-muted-foreground/40": isPending,
                  "text-green-500": isComplete,
                },
              )}
            >
              <div className="flex h-4 w-4 items-center justify-center">
                {isCurrent && <Loader2 className="h-4 w-4 animate-spin" />}
                {isComplete && <Check className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  if (
    generationState === GenerationState.CONTACTING_SERVER ||
    generationState === GenerationState.PACKING_REPOSITORY ||
    generationState === GenerationState.WAITING_FOR_AI
  ) {
    return <LoadingSteps currentState={generationState} />;
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
      className={cn(
        "min-h-[600px]",
        generationState === GenerationState.STREAMING && "border-primary",
      )}
      isGenerating={generationState !== GenerationState.IDLE}
    />
  );
}
