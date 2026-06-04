"use client";

import { createComment, deletePost, getPosts, toggleLike } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon, Share2, Link2, MessageSquare } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type GetPostsResult = Awaited<ReturnType<typeof getPosts>>;
type Post = GetPostsResult[number];

interface PostCardProps {
  post: Post;
  dbUserId: string | null;
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.423.002 9.835-4.407 9.838-9.83.001-2.628-1.01-5.1-2.846-6.938C16.427 1.993 13.971 1.01 11.83 1.01c-5.425 0-9.836 4.407-9.838 9.83-.001 2.056.541 4.062 1.572 5.83l-.974 3.56 3.654-.958zm12.188-6.195c-.328-.164-1.942-.958-2.242-1.069-.3-.11-.518-.164-.736.164-.218.328-.847 1.069-1.037 1.288-.19.218-.38.246-.708.082-.328-.164-1.386-.511-2.64-1.63-1.002-.893-1.678-1.996-1.875-2.324-.197-.328-.02-.505.144-.668.148-.147.328-.383.492-.574.164-.19.219-.328.328-.547.11-.219.055-.41-.027-.574-.082-.164-.736-1.776-1.009-2.432-.266-.649-.538-.562-.736-.572-.19-.01-.41-.01-.628-.01-.218 0-.573.082-.873.41-.3.328-1.147 1.12-1.147 2.73s1.174 3.167 1.338 3.385c.164.219 2.31 3.52 5.597 4.937.781.337 1.39.539 1.865.69.785.25 1.5.214 2.065.13.63-.092 1.942-.793 2.215-1.558.272-.765.272-1.422.19-1.557-.081-.137-.3-.219-.628-.383z" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const PostCard = memo(function PostCard({ post, dbUserId }: PostCardProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === dbUserId)
  );
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareClick = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const getPostUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/post/${post.id}`;
    }
    return `https://instax-g.vercel.app/post/${post.id}`;
  };

  const copyLink = useCallback(() => {
    const url = getPostUrl();
    navigator.clipboard.writeText(url);
    toast.success("Link copied successfully");
    handleCloseShareModal();
  }, [post.id]);

  const shareWhatsApp = useCallback(() => {
    const url = encodeURIComponent(getPostUrl());
    const text = encodeURIComponent("Check out this post on InstaX: ");
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, "_blank");
    handleCloseShareModal();
  }, [post.id]);

  const shareTwitter = useCallback(() => {
    const url = encodeURIComponent(getPostUrl());
    const text = encodeURIComponent("Check out this post on InstaX:");
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    handleCloseShareModal();
  }, [post.id]);

  const shareLinkedIn = useCallback(() => {
    const url = encodeURIComponent(getPostUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
    handleCloseShareModal();
  }, [post.id]);

  const isMobileShareSupported = () => {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
  };

  const shareNative = useCallback(async () => {
    const url = getPostUrl();
    try {
      await navigator.share({
        title: "InstaX Post",
        text: post.content || "Check out this post on InstaX",
        url: url,
      });
      handleCloseShareModal();
    } catch (err) {
      console.error("Native share failed", err);
    }
  }, [post.id, post.content]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch {
      setOptimisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, hasLiked, post.id, post._count.likes, post.likes, dbUserId]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      } else {
        toast.error(result?.error ?? "Failed to add comment");
      }
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  }, [newComment, isCommenting, post.id]);

  const handleDeletePost = useCallback(async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, post.id]);

  const toggleComments = useCallback(() => setShowComments((prev) => !prev), []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            {/* Author avatar — use AvatarImage (plain img) so Clerk URLs work */}
            <Link href={`/profile/${post.author.username}`} prefetch={false}>
              <Avatar className="size-8 sm:size-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                    prefetch={false}
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`} prefetch={false}>
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <Link href={`/post/${post.id}`} className="hover:underline" prefetch={false}>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </Link>
                  </div>
                </div>

                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <Link
              href={`/post/${post.id}`}
              prefetch={false}
              className="block rounded-lg overflow-hidden border border-border/10 group cursor-pointer"
            >
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
              />
            </Link>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                <HeartIcon className={`size-5 ${hasLiked ? "fill-current" : ""}`} />
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={toggleComments}
            >
              <MessageCircleIcon
                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span>{post.comments.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-emerald-500"
              onClick={handleShareClick}
            >
              <Share2 className="size-5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    {/* Comment author avatar — AvatarImage (plain img) */}
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  {/* Current user avatar — AvatarImage */}
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}

          {/* Share Dialog */}
          <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/40">
              <DialogHeader>
                <DialogTitle className="text-center font-bold text-xl">Share Post</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-4 py-4 text-center">
                {/* Copy Link */}
                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div className="size-12 rounded-full bg-secondary flex items-center justify-center transition-all group-hover:bg-secondary/80 group-hover:scale-105 active:scale-95">
                    <Link2 className="size-5 text-secondary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Copy Link</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={shareWhatsApp}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div className="size-12 rounded-full bg-[#25D366]/10 flex items-center justify-center transition-all group-hover:bg-[#25D366]/20 group-hover:scale-105 active:scale-95">
                    <WhatsAppIcon className="size-5 text-[#25D366]" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">WhatsApp</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={shareTwitter}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div className="size-12 rounded-full bg-foreground/10 flex items-center justify-center transition-all group-hover:bg-foreground/20 group-hover:scale-105 active:scale-95">
                    <XIcon className="size-5 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Twitter / X</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={shareLinkedIn}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div className="size-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center transition-all group-hover:bg-[#0A66C2]/20 group-hover:scale-105 active:scale-95">
                    <LinkedInIcon className="size-5 text-[#0A66C2]" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">LinkedIn</span>
                </button>
              </div>

              {isMobileShareSupported() && (
                <div className="pt-2 border-t border-border/40">
                  <Button
                    onClick={shareNative}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-2 flex items-center justify-center py-2.5 rounded-lg font-semibold"
                  >
                    <Share2 className="size-4" />
                    Share via system...
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
});

export default PostCard;
