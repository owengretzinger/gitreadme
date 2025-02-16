import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";

interface CustomInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  additionalContext: string;
  onAdditionalContextChange: (value: string) => void;
}

export function CustomInstructionsModal({
  open,
  onOpenChange,
  additionalContext,
  onAdditionalContextChange,
}: CustomInstructionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Custom Instructions</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Write anything else you want the AI to know about the project.
          </p>
        </DialogHeader>

        <Textarea
          id="context"
          placeholder={`Use this as the project link: https://example.com\nUse this as the logo: https://example.com/logo.png`}
          value={additionalContext}
          onChange={(e) => onAdditionalContextChange(e.target.value)}
          className="h-[300px] resize-none"
        />
      </DialogContent>
    </Dialog>
  );
}
