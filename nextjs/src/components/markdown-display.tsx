import { useRef, useEffect } from "react";
import { ViewModeToggle, type ViewMode } from "~/components/view-mode-toggle";
import { ContentView } from "~/components/content-view";
import { Textarea } from "~/components/ui/textarea";
import { ActionButton } from "./action-button";
import { Loader2, type LucideIcon } from "lucide-react";

interface MarkdownDisplayProps {
  title?: string;
  description?: string;
  content: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onChange?: (content: string) => void;
  showViewModeToggle?: boolean;
  actions?: Array<{
    icon: LucideIcon;
    onClick: () => void;
    showInMode?: ViewMode;
  }>;
  className?: string;
  contentClassName?: string;
  isMermaid?: boolean;
  isGenerating?: boolean;
}

export function MarkdownDisplay({
  title,
  description,
  content,
  viewMode,
  setViewMode,
  onChange,
  showViewModeToggle = !!onChange,
  actions = [],
  className = "",
  contentClassName = "",
  isMermaid = false,
  isGenerating = false,
}: MarkdownDisplayProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (content && viewMode === "edit") {
      resizeTextarea();
    }
  }, [content, viewMode]);

  const visibleActions = actions.filter(
    (action) => !action.showInMode || action.showInMode === viewMode,
  );

  return (
    <div className={className}>
      {(title ??
        description ??
        visibleActions.length > 0 ??
        showViewModeToggle) && (
        <div className="mb-4 gap-3 md:gap-0 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating</span>
              </div>
            )}
            {showViewModeToggle && (
              <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            )}
            {visibleActions.map((action, index) => (
              <ActionButton
                key={index}
                onClick={action.onClick}
                icon={<action.icon className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
      )}

      {viewMode === "edit" && onChange ? (
        <Textarea
          ref={textAreaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onInput={resizeTextarea}
          className="w-full resize-none overflow-hidden font-mono"
        />
      ) : isMermaid ? (
        <div className="mermaid">{content}</div>
      ) : (
        <ContentView
          content={content}
          viewMode={viewMode}
          className={contentClassName}
        />
      )}
    </div>
  );
}
