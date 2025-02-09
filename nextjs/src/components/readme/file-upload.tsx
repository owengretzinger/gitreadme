import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X } from "lucide-react";

interface FileUploadProps {
  uploadedFiles: FileList | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: (index: number) => void;
}

export function FileUpload({
  uploadedFiles,
  onFileChange,
  onFileDelete,
}: FileUploadProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="font-medium">Upload Files</Label>
        <p className="text-sm text-muted-foreground">
          Attach any additional context (ex. project documents)
        </p>
      </div>
      <Input
        id="files"
        type="file"
        multiple
        onChange={onFileChange}
        className="cursor-pointer"
      />
      {uploadedFiles && (
        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
          {Array.from(uploadedFiles).map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onFileDelete(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 