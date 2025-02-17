import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { type ApiErrorResponse } from "~/types/errors";
import Link from "next/link";

interface ErrorModalProps {
  error: ApiErrorResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionButton?: {
    label: string;
    href: string;
  };
}

export function ErrorModal({ error, open, onOpenChange, actionButton }: ErrorModalProps) {
  if (!error) return null;

  function formatString(input: string): string {
    return input
      .toLowerCase()
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-destructive max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Error Generating README</DialogTitle>
          <DialogDescription className="space-y-4 text-pretty pt-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <p className="font-medium">{formatString(error.type)} {"Error "}</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{error.message}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          {actionButton && (
            <Button asChild>
              <Link href={actionButton.href} onClick={() => onOpenChange(false)}>
                {actionButton.label}
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
