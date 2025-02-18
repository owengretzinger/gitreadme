"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import PreviewGithubStars from "./ui/github-stars/preview-github-stars";

export function NavButtons({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex pr-2">
        <PreviewGithubStars />
      </div>
      <ThemeToggle />
      {session?.user ? (
        <Button
          variant="ghost"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 w-fit"
        >
          <UserAvatar image={session.user.image} name={session.user.name} />
          Sign out
        </Button>
      ) : (
        <Link href="/signin">
          <Button variant="ghost">Sign in</Button>
        </Link>
      )}
    </div>
  );
}
