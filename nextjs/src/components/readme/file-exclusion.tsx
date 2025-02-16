import { useState, useEffect } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface LargeFile {
  path: string;
  size_kb: number;
}

interface FileExclusionProps {
  largeFiles: LargeFile[];
  onExclude: (paths: string[]) => void;
  excludePatterns: string[];
}

export function FileExclusion({ largeFiles, onExclude, excludePatterns }: FileExclusionProps) {
  const [manualPaths, setManualPaths] = useState<string>(excludePatterns.join("\n"));

  // Update manualPaths when excludePatterns prop changes
  useEffect(() => {
    setManualPaths(excludePatterns.join("\n"));
  }, [excludePatterns]);

  const toggleFile = (path: string, checked: boolean) => {
    const paths = manualPaths.split("\n").filter(p => p.trim() !== "");
    let newPaths: string[];
    
    if (checked) {
      newPaths = [...new Set([...paths, path])];
    } else {
      newPaths = paths.filter(p => p !== path);
    }
    
    const newManualPaths = newPaths.join("\n");
    setManualPaths(newManualPaths);
    onExclude(newPaths);
  };

  const handleManualPathsChange = (value: string) => {
    setManualPaths(value);
    const paths = value.split("\n").filter(path => path.trim() !== "");
    onExclude(paths);
  };

  return (
    <div className="space-y-6">
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
                    checked={manualPaths.split("\n").includes(file.path)}
                    onCheckedChange={(checked) => toggleFile(file.path, checked === true)}
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

      <div className="space-y-3">
        <div>
          <Label className="font-medium">File Paths to Exclude</Label>
          <p className="text-sm text-muted-foreground">
            Enter file paths to exclude (one per line). Supports glob patterns like *.md and /**/*.csv
          </p>
        </div>
        <Textarea
          value={manualPaths}
          onChange={(e) => handleManualPathsChange(e.target.value)}
          className="font-mono text-sm min-h-[300px]"
        />
      </div>
    </div>
  );
}
