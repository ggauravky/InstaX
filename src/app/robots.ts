import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/notifications/"],
    },
    sitemap: "https://instax-g.vercel.app/sitemap.xml",
  };
}
