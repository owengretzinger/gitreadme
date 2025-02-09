import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface AdditionalContextProps {
  value: string;
  onChange: (value: string) => void;
}

export function AdditionalContext({
  value,
  onChange,
}: AdditionalContextProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="font-medium">Custom Instructions</Label>
        <p className="text-sm text-muted-foreground">
          Write anything else you want the AI to know about the project.
        </p>
      </div>
      <Textarea
        id="context"
        placeholder="Add any additional context..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[150px] resize-none"
      />
    </div>
  );
} 