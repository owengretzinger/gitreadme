"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";
import { type Session } from "next-auth";
import { signOutAction } from "~/server/actions/auth";
import { Github } from "lucide-react";

export function NavButtons({ 
  session 
}: { 
  session: Session | null;
}) {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
          <Link
            href="https://github.com/owengretzinger/readme-generator"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
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