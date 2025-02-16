import { type RouterOutputs } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, GitBranch } from "lucide-react";

type GeneratedReadme = RouterOutputs["dashboard"]["getUserData"]["readmes"][number];

interface RecentReadmesProps {
  readmes: GeneratedReadme[];
}

export function RecentReadmes({ readmes }: RecentReadmesProps) {
  if (readmes.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-muted-foreground">Recent READMEs</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {readmes.slice(0, 6).map((readme) => (
          <Link
            key={readme.id}
            href={`/readme/${readme.repoPath}?v=${readme.version}`}
            className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="line-clamp-1 font-medium">{readme.repoPath}</span>
              <div className="text-sm text-muted-foreground">
                v{readme.version} · {readme.createdAt
                  ? formatDistanceToNow(new Date(readme.createdAt), {
                      addSuffix: true,
                    })
                  : "unknown time"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}