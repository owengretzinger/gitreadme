import { MarkdownEditor } from "~/components/markdown-editor";
import { GenerationState } from "~/hooks/use-readme-helpers/use-readme-stream";
import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";

interface GeneratedReadmeProps {
  initialContent: string | null;
  generationState: GenerationState;
  repoPath: string;
}

export function GeneratedReadme({
  initialContent,
  generationState,
  repoPath,
}: GeneratedReadmeProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Use a ref to track the last saved content to prevent unnecessary saves
  const lastSavedContentRef = useRef<string>(initialContent ?? "");

  const debouncedContent = useDebounce(content, 1000); // Debounce for 1 second

  const updateReadmeMutation = api.readme.updateReadme.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
      // Update lastSavedContentRef when save is successful
      lastSavedContentRef.current = debouncedContent;
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  useEffect(() => {
    setContent(initialContent ?? "");
    // Also update the ref when initialContent changes
    if (initialContent !== null) {
      lastSavedContentRef.current = initialContent;
    }
  }, [initialContent]);

  // Save changes to the database when content changes after debounce
  useEffect(() => {
    // Only trigger update if content has been edited, there's a repoPath,
    // and the debounced content differs from what was last saved
    if (
      repoPath &&
      debouncedContent !== lastSavedContentRef.current &&
      !isSaving // Prevent save if already saving
    ) {
      setIsSaving(true);
      updateReadmeMutation.mutate({ repoPath, content: debouncedContent });
    }
  }, [debouncedContent, repoPath, isSaving, updateReadmeMutation]);

  return (
    <MarkdownEditor
      content={content}
      onChange={(value) => {
        setContent(value);
      }}
      showCopyButton
      minHeight="600px"
      isGenerating={
        generationState !== GenerationState.NOT_STARTED &&
        generationState !== GenerationState.COMPLETED
      }
      isSaving={isSaving}
      lastSaved={lastSaved}
    />
  );
}
