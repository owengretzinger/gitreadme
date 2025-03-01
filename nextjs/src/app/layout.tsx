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
  title: "gitreadme.dev",
  description: "Generate READMEs using AI that understands your codebase",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <PostHogProvider>
              <SessionProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Nav />
                  <main className="mx-auto w-full max-w-7xl flex-1">
                    {children}
                  </main>
                  <Footer className="absolute bottom-0 w-full" />
                </div>
              </SessionProvider>
            </PostHogProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
