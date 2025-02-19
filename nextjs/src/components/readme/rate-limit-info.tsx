import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type RateLimitInfo } from "~/server/api/rate-limit";
interface RateLimitInfoProps {
  rateLimitInfo: RateLimitInfo | undefined;
  status: "authenticated" | "loading" | "unauthenticated";
}

export function RateLimitInfo({ rateLimitInfo, status }: RateLimitInfoProps) {
  if (!rateLimitInfo || status === "loading") {
    return <></>;
  }

  return (
    <div className="flex w-fit items-center text-xs text-muted-foreground">
      <span>
        {rateLimitInfo.remaining}/{rateLimitInfo.total} remaining today
      </span>
      {!rateLimitInfo.isAuthenticated && (
        <>
          <span>.&nbsp;</span>
          <Link
            href="/signin"
            className="text-center text-xs text-primary hover:underline"
          >
            <span className="flex items-center justify-center gap-1">
              Sign in to get 20/day free <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </>
      )}
    </div>
  );
}
