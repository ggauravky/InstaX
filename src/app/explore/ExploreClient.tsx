"use client";

import { useState, useEffect, useMemo, memo, useRef } from "react";
import { searchUsers } from "@/actions/profile.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import {
  Search,
  Users,
  TrendingUp,
  Loader2,
  ChevronRight,
  Compass,
} from "lucide-react";
import FollowButton from "@/components/FollowButton";
import type { getRecommendedCreators } from "@/actions/profile.action";
import type { getTrendingPosts } from "@/actions/post.action";

type RecommendedCreators = Awaited<ReturnType<typeof getRecommendedCreators>>;
type TrendingPosts = Awaited<ReturnType<typeof getTrendingPosts>>;
type SearchResultUser = Awaited<ReturnType<typeof searchUsers>>[number];

interface ExploreClientProps {
  initialRecommended: RecommendedCreators;
  initialTrending: TrendingPosts;
  dbUserId: string | null;
}

export default function ExploreClient({
  initialRecommended,
  initialTrending,
  dbUserId,
}: ExploreClientProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    setIsSearching(true);
    setError(null);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const searchData = await searchUsers(trimmedQuery);
        setResults(searchData);
      } catch (err) {
        console.error("Search error:", err);
        setError("Something went wrong with the search. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Search Input Area — Sticky below Navbar */}
      <div className="sticky top-16 bg-background/95 backdrop-blur z-20 py-4 border-b border-border/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users, profiles, or creators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 text-base rounded-full border-border/60 shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-border/80 transition-all"
            spellCheck={false}
            autoComplete="off"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Conditional Rendering: Search Results OR Discovery Feed */}
      {query.trim() !== "" ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Search Results</h2>
            <span className="text-xs text-muted-foreground">
              {results.length} results
            </span>
          </div>

          {isSearching && results.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive/20 bg-destructive/5 text-destructive text-center py-6 text-sm">
              {error}
            </Card>
          ) : results.length === 0 && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted/20 text-muted-foreground">
                <Search className="size-8" />
              </div>
              <div>
                <p className="font-semibold text-sm">No users found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  Try searching with a different username.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((user) => (
                <SearchResultCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Discovery: Suggested Creators */}
          {initialRecommended.length === 0 ? (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/10 pb-3">
                <Users className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-bold tracking-tight text-foreground/90">Suggested Creators</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="p-3.5 rounded-full bg-muted/20 text-muted-foreground">
                  <Users className="size-8" />
                </div>
                <div>
                  <p className="font-semibold text-sm">No recommendations available</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/10 pb-3">
                <Users className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-bold tracking-tight text-foreground/90">Suggested Creators</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {initialRecommended.map((creator) => (
                  <CreatorDiscoveryCard key={creator.id} creator={creator} />
                ))}
              </div>
            </section>
          )}

          {/* Discovery: Trending Posts */}
          {initialTrending.length === 0 ? (
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/10 pb-3">
                <Compass className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-bold tracking-tight text-foreground/90">Trending Posts</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="p-3.5 rounded-full bg-muted/20 text-muted-foreground">
                  <Compass className="size-8" />
                </div>
                <div>
                  <p className="font-semibold text-sm">No trending posts yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check back later.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border/10 pb-3">
                <Compass className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-bold tracking-tight text-foreground/90">Trending Posts</h2>
              </div>
              <div className="space-y-6">
                {initialTrending.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={dbUserId} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

const SearchResultCard = memo(function SearchResultCard({
  user,
}: {
  user: SearchResultUser;
}) {
  return (
    <Link href={`/profile/${user.username}`} prefetch={false}>
      <Card className="hover:bg-accent/40 active:bg-accent/60 transition-all border-border/30 cursor-pointer overflow-hidden group">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="size-12 shrink-0 border border-border/20">
            <AvatarImage src={user.image ?? "/avatar.png"} />
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-sm truncate text-foreground group-hover:text-foreground/90 transition-colors flex items-center gap-1.5">
              {user.name || user.username}
            </div>
            <div className="text-xs text-muted-foreground">@{user.username}</div>
            {user.bio && (
              <p className="text-xs text-muted-foreground/80 truncate mt-1 max-w-[90%]">
                {user.bio}
              </p>
            )}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/75 font-medium mt-1.5">
              <span>{user._count.followers.toLocaleString()} followers</span>
              <span>•</span>
              <span>{user._count.following.toLocaleString()} following</span>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground/35 group-hover:text-muted-foreground transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
});

const CreatorDiscoveryCard = memo(function CreatorDiscoveryCard({
  creator,
}: {
  creator: RecommendedCreators[number];
}) {
  return (
    <Card className="hover:bg-accent/10 transition-all border-border/35 overflow-hidden h-full flex flex-col justify-between shadow-none bg-card/30">
      <CardContent className="p-4 space-y-3 text-left">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/profile/${creator.username}`} className="flex items-center gap-3 min-w-0 group" prefetch={false}>
            <Avatar className="size-10 border border-border/20 group-hover:opacity-90 transition-opacity">
              <AvatarImage src={creator.image ?? "/avatar.png"} />
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate text-foreground group-hover:text-foreground/80 transition-colors">
                {creator.name || creator.username}
              </div>
              <p className="text-[10px] text-muted-foreground">@{creator.username}</p>
            </div>
          </Link>
          <div className="shrink-0">
            <FollowButton userId={creator.id} />
          </div>
        </div>
        {creator.bio && (
          <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed min-h-[32px]">
            {creator.bio}
          </p>
        )}
        <div className="text-[10px] text-muted-foreground/85 font-medium pt-2 border-t border-border/10 flex items-center justify-between">
          <Link href={`/profile/${creator.username}`} className="hover:underline text-muted-foreground/90 hover:text-foreground transition-colors" prefetch={false}>
            <span>{creator._count.followers.toLocaleString()} followers</span>
          </Link>
          <Link href={`/profile/${creator.username}`} className="flex items-center gap-1 text-muted-foreground/60 hover:text-foreground transition-colors" prefetch={false}>
            <span className="text-[9px]">View profile</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

const CardSkeleton = () => (
  <Card className="border-border/40 animate-pulse">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="size-12 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3.5 w-24 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded mt-1" />
      </div>
    </CardContent>
  </Card>
);
