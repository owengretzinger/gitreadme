import { cn } from "~/lib/utils";
import { templates } from "~/components/readme-templates/readme-templates";

interface TemplateSelectionProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateSelection({
  selectedTemplate,
  onTemplateSelect,
}: TemplateSelectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold">Template Selection</h3>
      <div className="mt-4 space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg",
              selectedTemplate === template.id && "border-primary",
            )}
            onClick={() => onTemplateSelect(template.id)}
          >
            <h4 className="font-medium">{template.name}</h4>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 