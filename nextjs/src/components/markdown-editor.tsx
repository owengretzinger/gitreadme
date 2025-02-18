import { useRef, useEffect, useCallback, useState } from "react";
import { ViewModeToggle, type ViewMode } from "~/components/view-mode-toggle";
import { Textarea } from "~/components/ui/textarea";
import { Check, Copy, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ActionButton } from "./action-button";

interface MarkdownEditorProps {
  content: string;
  onChange?: (content: string) => void;
  className?: string;
  contentClassName?: string;
  isGenerating?: boolean;
  showCopyButton?: boolean;
  minHeight?: string;
}

export function MarkdownEditor({
  content,
  onChange,
  className = "",
  contentClassName = "",
  isGenerating = false,
  showCopyButton = false,
  minHeight,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [isCopied, setIsCopied] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = useCallback(() => {
    if (!content) return;
    void navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [content]);

  const resizeTextarea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (content && viewMode === "edit") {
      resizeTextarea();
    }
  }, [content, viewMode]);

  return (
    <div className={cn(className, minHeight && `min-h-[${minHeight}]`)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            {isGenerating && (
              <div className="mr-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Streaming response</span>
              </div>
            )}
          </div>
          {showCopyButton && (
            <ActionButton
              onClick={handleCopy}
              icon={
                isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
              text={isCopied ? "Copied" : "Copy"}
            />
          )}
        </div>
      </div>

      {viewMode === "edit" ? (
        <Textarea
          ref={textAreaRef}
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          onInput={resizeTextarea}
          className={cn(
            "w-full resize-none overflow-hidden border-none font-mono focus:ring-0 focus-visible:ring-0",
            contentClassName,
          )}
        />
      ) : (
        <div
          className={cn(
            "prose prose-sm max-w-none dark:prose-invert",
            contentClassName,
          )}
        >
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
