import { getPostById } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return;

  const preview = post.content ? post.content.substring(0, 60) : "Check out this post";
  return {
    title: `Post by ${post.author.name || post.author.username} | InstaX`,
    description: `${preview}... View comments, likes, and more on InstaX.`,
    alternates: {
      canonical: `https://instax-g.vercel.app/post/${id}`,
    },
  };
}

export default async function PostDetailsPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const dbUserId = await getDbUserId();

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <PostCard post={post} dbUserId={dbUserId} />
    </div>
  );
}
