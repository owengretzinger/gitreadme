import Link from "next/link";
import { cn } from "~/lib/utils";

export default function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("", className)}>
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="https://github.com/owengretzinger"
            className="hover:text-primary hover:underline"
            target="_blank"
          >
            Designed & built by Owen Gretzinger
          </Link>
        </p>
      </div>
    </footer>
  );
}
