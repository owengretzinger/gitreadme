import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { Nav } from "~/components/nav";
import { PostHogProvider } from "~/app/providers";

export const metadata: Metadata = {
  title: "README Generator",
  description: "Your hackathon companion",
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
              <div className="relative flex min-h-screen flex-col">
                <Nav />
                <main className="mx-auto w-full max-w-7xl flex-1 px-4">
                  {children}
                </main>
              </div>
            </PostHogProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
