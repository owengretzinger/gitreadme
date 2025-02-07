import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { ViewMode } from "./view-mode-toggle";

interface ContentViewProps {
  viewMode: ViewMode;
  content: string;
  className?: string;
}

export function ContentView({
  viewMode,
  content,
  className,
}: ContentViewProps) {
  if (viewMode === "edit") {
    return (
      <pre
        className={cn(
          "whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm",
          className,
        )}
      >
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <div
      className={cn(
        "prose max-w-none rounded-lg bg-muted p-4 dark:prose-invert",
        className,
      )}
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  );
}
