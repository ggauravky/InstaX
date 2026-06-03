import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://instax-g.vercel.app";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.5, // This is just the fallback redirect route
    },
  ];

  // Dynamic user profile routes from database
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        updatedAt: true,
      },
    });

    const profileRoutes = users.map((user) => ({
      url: `${baseUrl}/profile/${user.username}`,
      lastModified: new Date(user.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...profileRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
