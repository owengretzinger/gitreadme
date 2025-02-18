import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { TemplateSelection } from "../template-selection";
import { MarkdownEditor } from "~/components/markdown-editor";

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
            <MarkdownEditor
              content={templateContent}
              onChange={onTemplateContentChange}
              minHeight="500px"
              contentClassName="w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
