"use client";

import { api, type RouterOutputs } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileText, GitBranch, Clock, ExternalLink } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";

type GeneratedReadme =
  RouterOutputs["dashboard"]["getUserData"]["readmes"][number];

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated READMEs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4 border-b pb-6 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-full sm:w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { data, isLoading } = api.dashboard.getUserData.useQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6 text-red-800">
          Failed to load dashboard data
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              {"Today's Usage"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.usageData.generationsToday} generations
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Last Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.usageData.lastGenerated
                ? formatDistanceToNow(new Date(data.usageData.lastGenerated), {
                    addSuffix: true,
                  })
                : "Never"}
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <GitBranch className="h-4 w-4" />
              Total READMEs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.readmes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated READMEs</CardTitle>
        </CardHeader>
        <CardContent>
          {data.readmes.length === 0 ? (
            <div className="text-muted-foreground">
              {"You haven't generated any READMEs yet."}
            </div>
          ) : (
            <div className="space-y-6">
              {data.readmes.map((readme: GeneratedReadme) => (
                <div
                  key={readme.id}
                  className="flex flex-col gap-4 border-b pb-6 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:pb-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium break-all">{readme.repoPath}</span>
                      <Badge variant="secondary">v{readme.version}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Generated{" "}
                      {readme.createdAt
                        ? formatDistanceToNow(new Date(readme.createdAt), {
                            addSuffix: true,
                          })
                        : "unknown time"}
                    </div>
                  </div>
                  <Button asChild variant="secondary" className="w-full sm:w-auto">
                    <Link href={`/readme/${readme.repoPath}?v=${readme.version}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
