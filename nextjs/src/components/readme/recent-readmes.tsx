import { type RouterOutputs } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useSession } from "next-auth/react";

type GeneratedReadme =
  RouterOutputs["dashboard"]["getUserData"]["readmes"][number];

interface RecentReadmesProps {
  readmes: GeneratedReadme[];
}

export function RecentReadmes({ readmes }: RecentReadmesProps) {
  const { status } = useSession();
  if (readmes.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Your recent READMEs
          </span>
        </h2>
        <Link
          href={status === "authenticated" ? "/dashboard" : "/signin"}
          className="text-center text-sm text-primary hover:underline"
        >
          <span className="flex items-center justify-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {readmes.slice(0, 6).map((readme) => (
          <Link
            key={readme.id}
            href={`/${readme.repoPath}?v=${readme.version}`}
            className="group flex flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="line-clamp-1 font-medium text-sm">
                {readme.repoPath}
              </span>
              <div className="text-xs text-muted-foreground">
                v{readme.version} ·{" "}
                {readme.createdAt
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
