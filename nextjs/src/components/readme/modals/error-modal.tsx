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

export function ErrorModal({
  error,
  open,
  onOpenChange,
  actionButton,
}: ErrorModalProps) {
  if (!error) return null;

  function formatString(input: string): string {
    return input
      .toLowerCase()
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-destructive">
        <DialogHeader>
          <DialogTitle>Error Generating README</DialogTitle>
          <DialogDescription className="sr-only">
            Error generating README. Please try again.
          </DialogDescription>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto text-pretty pt-4 text-sm text-muted-foreground">
            <p className="font-medium">
              {formatString(error.type)} {"Error "}
            </p>
            <p className="whitespace-pre-wrap">{error.message}</p>
          </div>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          {actionButton && (
            <Button asChild>
              <Link
                href={actionButton.href}
                onClick={() => onOpenChange(false)}
              >
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
