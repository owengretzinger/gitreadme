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

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent]);

  return (
    <MarkdownEditor
      content={content}
      onChange={(value) => setContent(value)}
      showCopyButton
      minHeight="600px"
      isGenerating={
        generationState !== GenerationState.NOT_STARTED &&
        generationState !== GenerationState.COMPLETED
      }
    />
  );
}
