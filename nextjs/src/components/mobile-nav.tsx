"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { type Session } from "next-auth";
import { NavButtons } from "./nav-buttons";

interface MobileNavProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  session: Session | null;
}

export function MobileNav({ links, session }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4">
            <NavButtons session={session} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
