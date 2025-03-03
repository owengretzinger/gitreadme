import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "~/components/dashboard/dashboard";
import { Toaster } from "~/components/ui/toaster";
import { Button } from "~/components/ui/button";
import { CirclePlus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="relative flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
      </div>
      <Dashboard />
      <div className="absolute left-0 top-0 h-[calc(100vh-6rem)] w-full sm:h-full pointer-events-none">
        <div className="absolute bottom-0 right-4 sm:top-0 pointer-events-auto">
          <Button variant="default">
            <Link href="/">
              <span className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4" />
                New README
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
