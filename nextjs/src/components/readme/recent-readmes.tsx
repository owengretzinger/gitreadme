import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowRight, FileText, Tag } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "~/components/ui/badge";

export function RecentReadmes() {
  const { status } = useSession();
  const { data: recentReadmes } = api.readme.getRecentReadmes.useQuery();

  if (!recentReadmes || recentReadmes.length === 0) return <></>;

  return (
    <div className="">
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
        {recentReadmes.slice(0, 6).map((readme) => (
          <Link
            key={readme.id}
            href={`/${readme.repoPath}/${readme.shortId}`}
            className="group flex flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <div className="line-clamp-1 text-sm font-medium">
                {readme.repoPath}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Tag className="mr-1 h-3 w-3" />
                  {readme.shortId}
                </span>
                <span className="text-xs">•</span>
                {readme.updatedAt
                  ? formatDistanceToNow(new Date(readme.updatedAt), {
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
