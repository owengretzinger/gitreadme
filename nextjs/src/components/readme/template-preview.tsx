import { useRef, useEffect } from "react";
import { ViewModeToggle, type ViewMode } from "~/components/view-mode-toggle";
import { ContentView } from "~/components/content-view";
import { Textarea } from "~/components/ui/textarea";

interface TemplatePreviewProps {
  templateContent: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onTemplateContentChange: (content: string) => void;
}

export function TemplatePreview({
  templateContent,
  viewMode,
  setViewMode,
  onTemplateContentChange,
}: TemplatePreviewProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (templateContent) {
      resizeTextarea();
    }
  }, [templateContent, viewMode]);

  return (
    <div>
      <div className="flex w-full items-center justify-between">
        <h3 className="text-lg font-semibold">Template Preview</h3>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
      <div className="mt-4">
        {viewMode === "edit" ? (
          <Textarea
            onInput={resizeTextarea}
            value={templateContent}
            onChange={(e) => onTemplateContentChange(e.target.value)}
            className="w-full resize-none overflow-hidden font-mono"
            ref={textAreaRef}
          />
        ) : (
          <ContentView
            content={templateContent}
            viewMode="preview"
            className="min-h-[500px] w-full rounded-lg border p-4"
          />
        )}
      </div>
    </div>
  );
} 