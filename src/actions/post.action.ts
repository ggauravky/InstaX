"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const post = await prisma.post.create({
      data: { content, image, authorId: userId },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, username: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true, image: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
          // NOTE: We load all comments here. For large scale, paginate separately.
          // Keeping full list for now since comment counts are typically small.
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Fetch like status and post author in parallel — eliminates one DB round-trip
    const [existingLike, post] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      }),
      prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      }),
    ]);

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      // Like + optionally notify post author
      await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };
    if (!content.trim()) return { success: false, error: "Content is required" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: { content, authorId: userId, postId },
      });

      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId)
      throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({ where: { id: postId } });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, image: true, username: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true, image: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error in getPostById", error);
    throw new Error("Failed to fetch post");
  }
}

export async function getTrendingPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: [
        { likes: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      take: 6,
      include: {
        author: {
          select: { id: true, name: true, image: true, username: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true, image: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("Error in getTrendingPosts", error);
    throw new Error("Failed to fetch trending posts");
  }
}
