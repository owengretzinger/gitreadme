import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Copy, Check, ExternalLink, History } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "~/hooks/use-toast";

interface ReadmeInfoCardProps {
  repoPath: string;
  version: number;
  createdAt: Date | null;
  permalink: string;
}

export function ReadmeInfoCard({
  repoPath,
  version,
  createdAt,
  permalink,
}: ReadmeInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPermalink = async () => {
    const url = new URL(permalink);
    url.searchParams.set("v", version.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Failed to copy to clipboard",
        description: "Please copy the permalink manually",
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                Repository
              </h2>
              <div className="flex items-center gap-2">
                <span>{repoPath}</span>
                <a
                  href={`https://github.com/${repoPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="">
              <h2 className="text-sm font-medium text-muted-foreground">
                Permalink
              </h2>
              <div className="flex items-center gap-2">
                <span className="max-w-full truncate">{permalink}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPermalink}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                Version
              </h2>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span>Version {version}</span>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                Created
              </h2>
              <p>
                {createdAt
                  ? format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
