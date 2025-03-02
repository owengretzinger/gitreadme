import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "gitreadme.dev - AI README Generator",
    short_name: "gitreadme",
    description:
      "Instantly generate high-quality README files using AI that understands your codebase",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#FFD700",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/logo.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/logo_with_bg.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["productivity", "developer tools", "utilities"],
    screenshots: [
      {
        src: "/screenshots/home.jpeg",
        type: "image/jpeg",
        sizes: "1280x720",
        label: "Home Screen of gitreadme.dev",
      },
    ],
    shortcuts: [
      {
        name: "Create New README",
        url: "/",
        description: "Generate a new README",
      },
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "View your generated READMEs",
      },
      {
        name: "About",
        url: "/about",
        description: "Learn more about gitreadme.dev",
      },
      {
        name: "Sign Up",
        url: "/signup",
        description: "Create an account",
      },
    ],
  };
}
