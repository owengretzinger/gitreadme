import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "~/components/dashboard/dashboard";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | README Generator",
  description: "View your generated READMEs and usage statistics",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            View your generated READMEs and usage statistics
          </p>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}
