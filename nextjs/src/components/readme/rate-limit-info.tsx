import { type RateLimitInfo as RateLimitInfoType } from "~/hooks/use-readme-form";
import { type Session } from "next-auth";

interface RateLimitInfoProps {
  rateLimitInfo: RateLimitInfoType | null;
  session: Session | null;
}

export function RateLimitInfo({ rateLimitInfo, session }: RateLimitInfoProps) {
  if (!rateLimitInfo) return null;

  return (
    <div className="text-sm text-muted-foreground">
      <p>
        {rateLimitInfo.remaining}/{rateLimitInfo.total} remaining today
        {!session && (
          <span className="">{" "}(sign in for 20 free generations per day)</span>
        )}
      </p>
    </div>
  );
}
