import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { Nav } from "~/components/nav";
import { PostHogProvider } from "~/app/providers";
import { SessionProvider } from "next-auth/react";
import Footer from "~/components/footer";

export const metadata: Metadata = {
  title: "gitreadme.dev — AI README Generator",
  description:
    "Instantly generate high-quality README files using AI that understands your codebase",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL("https://gitreadme.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gitreadme.dev",
    title: "gitreadme.dev",
    description:
      "Instantly generate high-quality README files using AI that understands your codebase",
    siteName: "gitreadme.dev",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "gitreadme.dev - AI README Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "gitreadme.dev",
    description:
      "Instantly generate high-quality README files using AI that understands your codebase",
    images: ["/opengraph-image.png"],
  },
  keywords: [
    "README generator",
    "AI documentation",
    "GitHub README",
    "code documentation",
    "repository documentation",
    "automatic README",
    "AI README creator",
    "code analysis",
    "documentation generator",
    "project documentation",
    "markdown generator",
    "repository analyzer",
    "codebase documentation",
    "developer tools",
    "open source documentation",
    "project showcase",
    "GitHub project",
    "code explanation",
    "software documentation",
  ],
  authors: [
    { name: "Owen Gretzinger", url: "https://github.com/owengretzinger" },
  ],
  creator: "Owen Gretzinger",
  publisher: "gitreadme.dev",
  category: "Developer Tools",
  applicationName: "gitreadme.dev — AI README Generator",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "gitreadme.dev",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "Instantly generate high-quality README files using AI that understands your codebase",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                ratingCount: "10",
              },
              author: {
                "@type": "Person",
                name: "Owen Gretzinger",
                url: "https://github.com/owengretzinger",
              },
              keywords:
                "README generator, AI documentation, GitHub README, code documentation, repository documentation",
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <SessionProvider>
              <PostHogProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Nav />
                  <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col">
                    {children}
                  </main>
                  <Footer className="absolute bottom-0 w-full" />
                </div>
              </PostHogProvider>
            </SessionProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
