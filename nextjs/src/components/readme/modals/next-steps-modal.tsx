import {
  Lightbulb,
  FileText,
  Video,
  ImageIcon,
  LayoutPanelTop,
  Youtube,
  Github,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Link from "next/link";
import { tutorialLink, githubLink } from "~/lib/links";

export function NextStepsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Tips for next steps
          </DialogTitle>
          <DialogDescription className="sr-only">
            Tips for next steps after generating a README.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-5">
            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Add the README to your project
              </h3>
              <p className="text-sm text-muted-foreground">
                Copy the README file and paste it into your project. Remove
                unnecessary sections, add additional information, and correct
                any inaccuracies.
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <ImageIcon className="h-4 w-4 text-primary" />
                Create a logo
              </h3>
              <p className="text-sm text-muted-foreground">
                Design a logo or generate one using AI, then give it rounded
                corners using{" "}
                <Link
                  href="https://quickpic.t3.gg/rounded-border"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  QuickPic
                </Link>
                .
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <LayoutPanelTop className="h-4 w-4 text-primary" />
                Generate a diagram
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate an architecture diagram with{" "}
                <Link
                  href="https://gitdiagram.com/"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  GitDiagram
                </Link>
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <Video className="h-4 w-4 text-primary" />
                Record a demo video
              </h3>
              <p className="text-sm text-muted-foreground">
                Most people who visit your repository won&apos;t run your
                project, so a video demo is extremely helpful for showcasing
                your work. Watch{" "}
                <Link
                  href="https://www.youtube.com/live/jDysqjK0HFo?si=jvwEmk4Vi5NkwVPd&t=451"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Buildspace Lecture #6 — The Perfect Demo
                </Link>
                .
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <Youtube className="h-4 w-4 text-primary" />
                Watch the gitreadme.dev tutorial
              </h3>
              <p className="text-sm text-muted-foreground">
                Learn tips for generating better READMEs by{" "}
                <Link
                  href={tutorialLink}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  watching the tutorial.
                </Link>
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <Star className="h-4 w-4 text-primary" />
                Create a star history chart
              </h3>
              <p className="text-sm text-muted-foreground">
                Use{" "}
                <Link
                  href="https://star-history.com/"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  star-history.com
                </Link>{" "}
                to create a chart of the number of stars on your repository over
                time.
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <Github className="h-4 w-4 text-primary" />
                Star this project
              </h3>
              <p className="text-sm text-muted-foreground">
                If you found this tool useful, consider giving it a{" "}
                <Link
                  href={githubLink}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  star on GitHub
                </Link>{" "}
                to support the project.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
