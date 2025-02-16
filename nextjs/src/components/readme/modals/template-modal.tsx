import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
      <DialogContent className="max-h-[90vh] max-w-[90vw] gap-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Template</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col divide-y md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
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
