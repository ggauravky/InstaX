import { getRecommendedCreators } from "@/actions/profile.action";
import { getTrendingPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import ExploreClient from "./ExploreClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore",
  description: "Search users, discover trending content, and connect with popular creators on InstaX.",
};

export default async function ExplorePage() {
  const [recommendedCreators, trendingPosts, dbUserId] = await Promise.all([
    getRecommendedCreators(),
    getTrendingPosts(),
    getDbUserId(),
  ]);

  return (
    <ExploreClient
      initialRecommended={recommendedCreators}
      initialTrending={trendingPosts}
      dbUserId={dbUserId}
    />
  );
}
