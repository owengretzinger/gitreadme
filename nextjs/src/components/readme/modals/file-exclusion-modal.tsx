import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { useEffect, useState } from "react";

interface FileExclusionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  largeFiles: Array<{ path: string; size_kb: number }>;
  onExclude: (paths: string[]) => void;
  excludePatterns: string[];
}

export function FileExclusionModal({
  open,
  onOpenChange,
  largeFiles,
  onExclude,
  excludePatterns,
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
          <p className="text-sm text-muted-foreground">
            Enter file paths to exclude (one per line). Supports glob patterns
            like *.md and /**/*.csv.
          </p>
        </DialogHeader>

        {largeFiles.length > 0 && (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">Select Files to Exclude</Label>
              <p className="text-sm text-muted-foreground">
                README generation failed because the repository is too large.
                Select files to exclude from the repository analysis, then click
                Generate README again.
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
                        {file.size_kb.toFixed(1)} KB
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

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
