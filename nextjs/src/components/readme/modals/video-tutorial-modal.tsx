import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { tutorialLink } from "~/lib/links";
interface VideoTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoTutorialModal({
  open,
  onOpenChange,
}: VideoTutorialModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Video Tutorial</DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          <iframe
            className="h-full w-full rounded-lg"
            src={tutorialLink}
            title="gitreadme.dev Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
