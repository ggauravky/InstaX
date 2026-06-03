import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) return;

  const title = `${user.name ?? user.username} (@${user.username})`;
  const description =
    user.bio ||
    `Connect with ${user.name ?? user.username} (@${user.username}) on InstaX — the modern, blazing-fast Next.js social media network. Check out their posts and followings.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://instax-g.vercel.app/profile/${user.username}`,
    },
    openGraph: {
      title: `${title} | InstaX`,
      description,
      url: `https://instax-g.vercel.app/profile/${user.username}`,
      type: "profile",
      username: user.username,
      images: [
        {
          url: user.image ?? "https://instax-g.vercel.app/avatar.png",
          width: 256,
          height: 256,
          alt: `${user.username}'s profile avatar`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${title} | InstaX`,
      description,
      images: [user.image ?? "https://instax-g.vercel.app/avatar.png"],
    },
  };
}

async function ProfilePageServer({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: user.name ?? user.username,
      alternateName: user.username,
      identifier: user.id,
      image: user.image ?? "https://instax-g.vercel.app/avatar.png",
      description: user.bio ?? "",
      url: `https://instax-g.vercel.app/profile/${user.username}`,
      knowsAbout: ["Social Media", "Open Source Platforms", "Software Engineering"],
      sameAs: [
        user.website
          ? user.website.startsWith("http")
            ? user.website
            : `https://${user.website}`
          : "",
      ].filter(Boolean),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <ProfilePageClient
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollowing}
      />
    </>
  );
}
export default ProfilePageServer;
