import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "~/server/auth";
import Image from "next/image";
import { NavButtons } from "./nav-buttons";

const links = [
  {
    href: "/readme",
    label: "README Generator",
  },
  {
    href: "/architecture",
    label: "Architecture Diagram",
  },
];

export async function Nav() {
  const session = await auth();

  return (
    <nav className="w-full border-b">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/hackmate_logo_black.webp"
              alt="HackMate Logo"
              width={24}
              height={24}
              className="block dark:hidden"
            />
            <Image
              src="/hackmate_logo_white.webp"
              alt="HackMate Logo"
              width={24}
              height={24}
              className="hidden dark:block"
            />
            <span className="font-bold">README Generator</span>
          </Link>
          <div className="flex items-center text-sm font-medium">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                <Button variant="ghost">{link.label}</Button>
              </Link>
            ))}
          </div>
        </div>
        <NavButtons session={session} />
      </div>
    </nav>
  );
}
