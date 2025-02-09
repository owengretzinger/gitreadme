import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Label } from "../ui/label";

interface LargeFile {
  path: string;
  size_kb: number;
}

interface FileExclusionProps {
  largeFiles: LargeFile[];
  onExclude: (paths: string[]) => void;
}

export function FileExclusion({ largeFiles, onExclude }: FileExclusionProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
    onExclude(Array.from(newSelected));
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <Label className="font-medium">Large Files Detected</Label>
        <p className="text-sm text-muted-foreground">
          Select files to exclude from the repository analysis, then click
          Generate README again
        </p>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        <div className="space-y-2">
          {largeFiles.map((file) => (
            <div key={file.path} className="flex items-center space-x-3">
              <Checkbox
                id={file.path}
                checked={selectedFiles.has(file.path)}
                onCheckedChange={() => toggleFile(file.path)}
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
  );
}
