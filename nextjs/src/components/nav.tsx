import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "~/server/auth";
import Image from "next/image";
import { NavButtons } from "./nav-buttons";
import { MobileNav } from "./mobile-nav";

const publicLinks = [
  {
    href: "/faq",
    label: "FAQ",
  },
];

const authenticatedLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
];

export async function Nav() {
  const session = await auth();
  const links = [...publicLinks, ...(session?.user ? authenticatedLinks : [])];

  return (
    <nav className="w-full border-b">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/light_logo.png"
              alt="HackMate Logo"
              width={24}
              height={24}
              className="dark:hidden"
            />
            <Image
              src="/dark_logo.png"
              alt="HackMate Logo"
              width={24}
              height={24}
              className="hidden dark:block"
            />
            <span className="font-bold">README Generator</span>
          </Link>
          <div className="hidden items-center text-sm font-medium sm:flex">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                <Button variant="ghost">{link.label}</Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <NavButtons session={session} />
          </div>
          <MobileNav links={links} session={session} />
        </div>
      </div>
    </nav>
  );
}
