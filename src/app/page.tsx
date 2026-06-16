import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InstaX - Premium Next.js Social Media Platform",
  description:
    "Experience InstaX, the open-source social media application powered by Next.js 16, React 19, Tailwind CSS v4, Prisma, and Neon PostgreSQL. Explore real-time feeds, post creation, follows, notifications, and instant dark mode.",
  alternates: {
    canonical: "https://instax-g.vercel.app",
  },
  openGraph: {
    title: "InstaX - Premium Next.js Social Media Platform",
    description:
      "Experience InstaX, the open-source social media application powered by Next.js 16, React 19, Tailwind CSS v4, Prisma, and Neon PostgreSQL.",
    url: "https://instax-g.vercel.app",
    siteName: "InstaX",
    type: "website",
    images: [
      {
        url: "https://instax-g.vercel.app/social-preview.svg",
        width: 1200,
        height: 630,
        alt: "InstaX OpenGraph Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaX - Premium Next.js Social Media Platform",
    description:
      "Experience InstaX, the open-source social media application powered by Next.js 16, React 19, Tailwind CSS v4, Prisma, and Neon PostgreSQL.",
    images: ["https://instax-g.vercel.app/social-preview.svg"],
  },
};

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://instax-g.vercel.app/#website",
        url: "https://instax-g.vercel.app/",
        name: "InstaX",
        description: "Premium Next.js Social Media Platform",
        publisher: {
          "@id": "https://ggauravky.vercel.app/#person",
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://instax-g.vercel.app/profile?search={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://instax-g.vercel.app/#software",
        name: "InstaX",
        url: "https://instax-g.vercel.app/",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "All",
        screenshot: "https://instax-g.vercel.app/social-preview.svg",
        softwareVersion: "1.0.0",
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD",
        },
        author: {
          "@id": "https://ggauravky.vercel.app/#person",
        },
      },
      {
        "@type": "Person",
        "@id": "https://ggauravky.vercel.app/#person",
        name: "Gaurav Kumar Yadav",
        url: "https://ggauravky.vercel.app",
        sameAs: [
          "https://github.com/ggauravky",
          "https://linkedin.com/in/gauravky",
        ],
        jobTitle: "Full-Stack Web Developer",
        description:
          "Senior Open Source Maintainer and Developer of InstaX.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          {/* Show Create Post only to logged-in users */}
          {user && <CreatePost />}

          {/* Public Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                dbUserId={dbUserId}
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          <WhoToFollow />
        </div>
      </div>
    </>
  );
}