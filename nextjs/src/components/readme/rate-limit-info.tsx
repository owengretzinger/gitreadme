import { Progress } from "~/components/ui/progress";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type RateLimitInfo } from "~/server/api/rate-limit";
interface RateLimitInfoProps {
  rateLimitInfo: RateLimitInfo | undefined;
  status: "authenticated" | "loading" | "unauthenticated";
}

export function RateLimitInfo({ rateLimitInfo, status }: RateLimitInfoProps) {
  const remaining = rateLimitInfo?.remaining ?? 0;
  const total = rateLimitInfo?.total ?? 0;
  const percentage = (remaining / total) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex w-[200px] flex-col items-center gap-2 rounded-xl border px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-medium">{remaining}</span>
            <span className="text-muted-foreground">
              {" "}
              generations remaining
            </span>
          </div>
        </div>
        <Progress
          value={percentage}
          className="h-1.5 bg-muted [&>div]:bg-primary"
        />
      </div>
      <Link
        href="/signin"
        className={`text-center text-xs text-primary hover:underline ${status === "unauthenticated" ? "opacity-100" : "opacity-0"}`}
      >
        <span className="flex items-center justify-center gap-1">
          Sign in to get 20/day free <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </div>
  );
}
