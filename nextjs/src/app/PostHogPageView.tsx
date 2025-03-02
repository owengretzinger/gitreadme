// app/PostHogPageView.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import { phCapture, identifyUser, resetUser } from "~/lib/posthog";
import { useSession } from "next-auth/react";

function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { data: session, status } = useSession();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      phCapture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  // Identify user when they're logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Identify the user in PostHog
      identifyUser(session.user.id, {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      });
    } else if (status === "unauthenticated") {
      // Reset user when logged out
      resetUser();
    }
  }, [status, session]);

  return null;
}

// Wrap this in Suspense to avoid the `useSearchParams` usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
export default function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
