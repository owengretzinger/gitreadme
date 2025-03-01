import { MarkdownEditor } from "~/components/markdown-editor";
import { GenerationState } from "~/hooks/use-readme-helpers/use-readme-stream";
import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";

interface GeneratedReadmeProps {
  initialContent: string | null;
  generationState: GenerationState;
  repoPath: string;
  shortId: string;
  isOwner?: boolean;
}

export function GeneratedReadme({
  initialContent,
  generationState,
  repoPath,
  shortId,
  isOwner = true,
}: GeneratedReadmeProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const contentIdRef = useRef<string>(`${repoPath}-${shortId}`);

  // Use a ref to track the last saved content to prevent unnecessary saves
  const lastSavedContentRef = useRef<string>(initialContent ?? "");

  // Lock to prevent saving when navigating between READMEs
  const isProcessingContentChangeRef = useRef(false);

  const debouncedContent = useDebounce(content, 1000); // Debounce for 1 second

  const updateReadmeMutation = api.readme.updateReadme.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
      // Update lastSavedContentRef when save is successful
      lastSavedContentRef.current = debouncedContent;
    },
    onError: (error) => {
      console.error("Error saving README:", error);
      setIsSaving(false);
    },
  });

  // Handle initialContent changes (when navigating between READMEs)
  useEffect(() => {
    const currentContentId = `${repoPath}-${shortId}`;

    // Only reset content if README identity has changed
    if (currentContentId !== contentIdRef.current) {
      isProcessingContentChangeRef.current = true;
      contentIdRef.current = currentContentId;

      // Cancel any pending saves
      setIsSaving(false);

      // Reset content and saved state for new README
      setContent(initialContent ?? "");
      lastSavedContentRef.current = initialContent ?? "";
      setLastSaved(null);

      // Re-enable saving after a short delay
      setTimeout(() => {
        isProcessingContentChangeRef.current = false;
      }, 300);
    } else if (initialContent !== null && initialContent !== content && generationState !== GenerationState.COMPLETED) {
      // Same README but content updated externally (like during generation)
      // Only update if generation is not complete, to avoid overwriting user edits
      setContent(initialContent);
      lastSavedContentRef.current = initialContent;
    }
  }, [initialContent, repoPath, shortId, content, generationState]);

  // Save changes to the database when content changes after debounce
  useEffect(() => {
    // Skip saving during README navigation or content reset
    if (isProcessingContentChangeRef.current) {
      return;
    }
    
    // Skip saving if we're still generating the README
    if (generationState !== GenerationState.COMPLETED && generationState !== GenerationState.NOT_STARTED) {
      return;
    }

    // Skip saving if user is not the owner
    if (!isOwner) {
      return;
    }

    // Only trigger update if:
    // 1. Content changed
    // 2. We have repoPath and shortId
    // 3. Not already saving
    // 4. The content differs from what was last saved
    if (
      repoPath &&
      shortId &&
      debouncedContent !== lastSavedContentRef.current &&
      !isSaving
    ) {
      setIsSaving(true);
      updateReadmeMutation.mutate({
        repoPath,
        shortId,
        content: debouncedContent,
      });
    }
  }, [
    debouncedContent,
    repoPath,
    shortId,
    isSaving,
    updateReadmeMutation,
    generationState,
    isOwner,
  ]);

  return (
    <MarkdownEditor
      content={content}
      onChange={(value) => {
        // Allow content updates only if user is the owner and not processing README changes
        if (!isProcessingContentChangeRef.current && isOwner) {
          setContent(value);
        }
      }}
      showCopyButton
      minHeight="600px"
      isGenerating={
        generationState !== GenerationState.NOT_STARTED &&
        generationState !== GenerationState.COMPLETED
      }
      isSaving={isSaving}
      lastSaved={lastSaved}
      readOnly={!isOwner}
    />
  );
}
