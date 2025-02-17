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
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        <PreviewGithubStars />
        <ThemeToggle />
      </div>
      {session?.user ? (
        <Button
          variant="ghost"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2"
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
