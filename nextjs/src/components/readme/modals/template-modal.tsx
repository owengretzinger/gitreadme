import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { TemplateSelection } from "../template-selection";
import { TemplatePreview } from "../template-preview";
import { type ViewMode } from "~/components/view-mode-toggle";
import { useState } from "react";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  templateContent: string;
  onTemplateContentChange: (content: string) => void;
}

export function TemplateModal({
  open,
  onOpenChange,
  selectedTemplate,
  onTemplateSelect,
  templateContent,
  onTemplateContentChange,
}: TemplateModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("edit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90%] min-w-[90%] gap-6 overflow-y-auto">
        <DialogTitle className="hidden">Choose Template</DialogTitle>
        <div className="flex h-full flex-1 grow flex-col justify-start divide-y md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="pb-6 md:pb-0 md:pr-6">
            <TemplateSelection
              selectedTemplate={selectedTemplate}
              onTemplateSelect={onTemplateSelect}
            />
          </div>
          <div className="pt-6 md:pl-6 md:pt-0">
            <TemplatePreview
              templateContent={templateContent}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onTemplateContentChange={onTemplateContentChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
