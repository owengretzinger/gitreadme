import { MarkdownEditor } from "~/components/markdown-editor";
import { GenerationState } from "~/hooks/use-readme-helpers/use-readme-stream";
import { useEffect, useState } from "react";

interface GeneratedReadmeProps {
  initialContent: string | null;
  generationState: GenerationState;
}

export function GeneratedReadme({
  initialContent,
  generationState,
}: GeneratedReadmeProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent]);

  return (
    <MarkdownEditor
      content={content}
      onChange={(value) => {
        setContent(value);
        setHasBeenEdited(true);
      }}
      showCopyButton
      minHeight="600px"
      isGenerating={
        generationState !== GenerationState.NOT_STARTED &&
        generationState !== GenerationState.COMPLETED
      }
      showHasBeenEdited={hasBeenEdited}
    />
  );
}
