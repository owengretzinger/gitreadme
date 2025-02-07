"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";
import { type Session } from "next-auth";
import { signOutAction } from "~/server/actions/auth";

export function NavButtons({ 
  session 
}: { 
  session: Session | null;
}) {
  return (
    <div className="flex items-center">
      <ThemeToggle />
      {session?.user ? (
        <form action={signOutAction}>
          <Button
            variant="ghost"
            type="submit"
            className="flex items-center gap-2"
          >
            <UserAvatar 
              image={session.user.image}
              name={session.user.name}
            />
            Sign out
          </Button>
        </form>
      ) : (
        <Link href="/signin">
          <Button variant="ghost">Sign in</Button>
        </Link>
      )}
    </div>
  );
} 