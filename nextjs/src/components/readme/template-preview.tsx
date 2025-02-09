import { type ViewMode } from "~/components/view-mode-toggle";
import { MarkdownDisplay } from "~/components/markdown-display";

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
  return (
    <MarkdownDisplay
      title="Template Preview"
      content={templateContent}
      viewMode={viewMode}
      setViewMode={setViewMode}
      onChange={onTemplateContentChange}
      contentClassName="min-h-[500px] w-full rounded-lg border p-4"
    />
  );
} 