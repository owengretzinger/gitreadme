import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { githubLink, tutorialLink } from "~/lib/links";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl py-8 md:py-12 px-4">
      <div className="mt-4 flex flex-col gap-10 sm:mt-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <h1 className="text-pretty text-center text-3xl font-bold sm:text-4xl">
              About gitreadme.dev
            </h1>
          </div>
          <p className="text-pretty text-center text-muted-foreground">
            Learn how gitreadme.dev works and get answers to common questions
          </p>
        </div>

        <div className="mx-auto w-full">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base sm:text-lg text-left font-medium">
                How does it work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                gitreadme.dev uses{" "}
                <Link
                  href="https://github.com/cyclotruc/gitingest"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  gitingest
                </Link>{" "}
                to pack your entire repository into a single file that is
                optimized for LLM intake, and then feeds that plus additional
                context into Gemini 2.0 Flash to generate the README.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base sm:text-lg text-left font-medium">
                Can I use gitreadme.dev with private repositories?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. This limitation exists because{" "}
                <Link
                  href="https://github.com/cyclotruc/gitingest"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  gitingest
                </Link>
                , which is used to pack the repository into one file, does not
                support private repos. I may explore solutions for private repo
                support in the future.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base sm:text-lg text-left font-medium">
                Is there a paid tier?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No, but gitreadme.dev is free to use with generous limits. It
                will stay free unless usage grows significantly. If needed, a
                future paid tier might offer higher token limits (up to 1
                million), increased usage, better AI models, and usage with
                private repositories.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-base sm:text-lg text-left font-medium">
                What is the best way to support this project?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <Link
                  href={githubLink}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Star the project
                </Link>{" "}
                on GitHub and share it with others!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-base sm:text-lg text-left font-medium">
                Any tips for power users?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <Link
                  href={tutorialLink}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Watch the tutorial
                </Link>{" "}
                for a complete overview. Key features include custom README
                templates, file exclusion patterns, custom instructions, and
                version management.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
