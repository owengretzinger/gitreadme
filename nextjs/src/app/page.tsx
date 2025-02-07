import { FileCheck, Mic, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="container">
        <section className="py-16">
          <div className="container overflow-hidden">
            <div className="mb-20 flex flex-col items-center gap-6 text-center">
              <Badge variant="outline">AI-Powered</Badge>
              <div>
                <h1 className="text-4xl font-semibold lg:text-6xl">
                  Your Ultimate
                  <br /> Hackathon Companion
                </h1>
              </div>
            </div>
            <div className="relative mx-auto max-w-screen-lg">
              <Image
                src="/screenshots/readme-generator-2.png"
                alt="HackMate Demo"
                className="aspect-video max-h-[500px] w-full rounded-xl object-cover"
                width={1000}
                height={1000}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              <div className="absolute -right-28 -top-28 -z-10 aspect-video h-72 w-96 opacity-40 [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] sm:bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)]"></div>
              <div className="absolute -left-28 -top-28 -z-10 aspect-video h-72 w-96 opacity-40 [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] sm:bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)]"></div>
            </div>
            <div className="mx-auto mt-10 flex max-w-screen-lg flex-col md:flex-row">
              <Link
                href="/inspiration"
                className="flex grow basis-0 flex-col rounded-md bg-background p-4 transition-colors hover:bg-accent"
              >
                <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-background drop-shadow-lg">
                  <Zap className="h-auto w-5" />
                </div>
                <h3 className="mb-2 font-semibold">Project Inspiration</h3>
                <p className="text-pretty text-sm text-muted-foreground">
                  Browse winning projects from past hackathons to get inspired
                  and learn from successful teams.
                </p>
              </Link>
              <Separator
                orientation="vertical"
                className="mx-6 hidden h-auto w-[2px] bg-gradient-to-b from-muted via-transparent to-muted md:block"
              />
              <Link
                href="/readme"
                className="flex grow basis-0 flex-col rounded-md bg-background p-4 transition-colors hover:bg-accent"
              >
                <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-background drop-shadow-lg">
                  <FileCheck className="h-auto w-5" />
                </div>
                <h3 className="mb-2 font-semibold">Project Documentation</h3>
                <p className="text-pretty text-sm text-muted-foreground">
                  Generate professional README files and architecture diagrams
                  powered by Google Cloud Vertex AI.
                </p>
              </Link>
              <Separator
                orientation="vertical"
                className="mx-6 hidden h-auto w-[2px] bg-gradient-to-b from-muted via-transparent to-muted md:block"
              />
              <Link
                href="/pitch"
                className="flex grow basis-0 flex-col rounded-md bg-background p-4 transition-colors hover:bg-accent"
              >
                <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-background drop-shadow-lg">
                  <Mic className="h-auto w-5" />
                </div>
                <h3 className="mb-2 font-semibold">Pitch Assistant</h3>
                <p className="text-pretty text-sm text-muted-foreground">
                  Create compelling pitches with AI guidance on structure,
                  content, and delivery.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
