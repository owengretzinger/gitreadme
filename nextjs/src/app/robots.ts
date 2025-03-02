import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://gitreadme.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/faq"],
        disallow: ["/api/*", "/signin/*", "/_next/*", "/private/*", "/*.json$"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/*", "/signin/*"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/*", "/signin/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
