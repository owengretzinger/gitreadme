import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Checkbox } from "~/components/ui/checkbox";
import { useEffect, useState } from "react";
import type { ApiErrorResponse } from "~/types/errors";

interface FileExclusionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  largeFiles: Array<{ path: string; tokens: number }>;
  onExclude: (paths: string[]) => void;
  excludePatterns: string[];
  generationError: ApiErrorResponse | null;
}

export function FileExclusionModal({
  open,
  onOpenChange,
  largeFiles,
  onExclude,
  excludePatterns,
  generationError,
}: FileExclusionModalProps) {
  const [text, setText] = useState<string>(excludePatterns.join("\n"));
  const [error, setError] = useState<string | null>(null);

  // Update the text and error when the modal opens
  useEffect(() => {
    setText(excludePatterns.join("\n"));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleFile = (path: string, checked: boolean) => {
    const paths = text.split("\n").filter((p) => p.trim() !== "");
    let newPaths: string[];

    if (checked) {
      newPaths = [...new Set([...paths, path])];
    } else {
      newPaths = paths.filter((p) => p !== path);
    }

    const newManualPaths = newPaths.join("\n");
    setText(newManualPaths);
    setError(null);
    onExclude(newPaths);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    setError(null);

    const paths = newValue
      .split("\n")
      .map((path) => path.trim())
      .filter((path) => path !== "");

    const validRegex = /^[a-zA-Z0-9\s\-_./+*]*$/;

    const [validPaths, invalidPaths] = paths.reduce<[string[], string[]]>(
      ([valid, invalid], path) => {
        if (validRegex.test(path)) {
          return [[...valid, path], invalid];
        }
        return [valid, [...invalid, path]];
      },
      [[], []],
    );

    if (invalidPaths.length > 0) {
      setError(
        "Invalid file path(s): " +
          invalidPaths.map((path) => `"${path}"`).join(", "),
      );
    }

    onExclude(validPaths);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exclude Files</DialogTitle>
          <DialogDescription className="sr-only">
            Specify files or patterns to exclude from the README generation.
          </DialogDescription>
        </DialogHeader>

        {largeFiles.length > 0 && (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-red-500">
                <p>{generationError?.message}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Easily exclude the largest files by clicking on them below, or
                add file paths manually.
              </p>
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {largeFiles.map((file) => (
                  <div key={file.path} className="flex items-center space-x-3">
                    <Checkbox
                      id={file.path}
                      checked={text.split("\n").includes(file.path)}
                      onCheckedChange={(checked) =>
                        toggleFile(file.path, checked === true)
                      }
                    />
                    <label
                      htmlFor={file.path}
                      className="flex flex-1 items-center justify-between text-sm"
                    >
                      <span className="font-mono">{file.path}</span>
                      <span className="text-muted-foreground">
                        {file.tokens.toLocaleString()} tokens
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Enter file paths to exclude (one per line).
          <br />
          Examples: node_modules, *.csv, dist/*, /exact/path/from/root.txt
        </p>

        <Textarea
          value={text}
          onChange={handleChange}
          className="min-h-[300px] resize-none font-mono text-sm"
        />

        {error && (
          <div className="text-sm text-red-500">
            <p>{error}</p>
            <p>
              Only alphanumeric characters, spaces, and the following symbols
              are allowed: - _ . / + *
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
