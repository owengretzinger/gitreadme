import { useRef, useEffect, useCallback, useState } from "react";
import { ViewModeToggle, type ViewMode } from "~/components/view-mode-toggle";
import { Textarea } from "~/components/ui/textarea";
import { Check, CircleAlert, Cloud, Copy, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { ActionButton } from "./action-button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  content: string;
  onChange?: (content: string) => void;
  className?: string;
  contentClassName?: string;
  isGenerating?: boolean;
  showCopyButton?: boolean;
  minHeight?: string;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function MarkdownEditor({
  content,
  onChange,
  className = "",
  contentClassName = "",
  isGenerating = false,
  showCopyButton = false,
  minHeight,
  isSaving = false,
  lastSaved = null,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [isCopied, setIsCopied] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Handle hash changes and initial load
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash && contentRef.current) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("hashchange", scrollToHash);
    scrollToHash();

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [content]);

  return (
    <div className={cn(className, minHeight && `min-h-[${minHeight}]`)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-fit flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            {isGenerating && (
              <div className="mr-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Streaming response</span>
              </div>
            )}
            {(isSaving || lastSaved) && (
              <div className="mr-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Cloud className="h-4 w-4" />
                {isSaving && <span>Saving changes...</span>}
                {!isSaving && lastSaved && (
                  <span>Last saved at {lastSaved.toLocaleTimeString()}</span>
                )}
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
          ref={contentRef}
          className="prose prose-sm max-w-none dark:prose-invert [&_pre]:!bg-transparent [&_pre]:!p-0"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{
              // @ts-expect-error - This is a valid assignment
              code({ className, children, inline, ...rest }) {
                const match = /language-(\w+)/.exec(className ?? "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    PreTag="div"
                    language={match[1]}
                    // @ts-expect-error - This is a valid assignment
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    style={dracula}
                    customStyle={{ margin: 0 }}
                    className="rounded-lg"
                    {...rest}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    {...rest}
                    className={cn(
                      className,
                      "rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs before:content-none after:content-none",
                    )}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
