"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import { validateUsernameFormat } from "@/lib/username";



export async function getProfileByUsername(username: string) {
  try {
    if (!username) return null;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        clerkId: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, username: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      where: { likes: { some: { userId } } },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, username: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return likedPosts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: { name, bio, location, website },
    });

    revalidatePath(`/profile/${user.username}`);
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Updates the authenticated user's username.
 *
 * Validates format, uniqueness, and reserved words before saving.
 * Returns success + new username (for client-side redirect), or an error string.
 */
export async function updateUsername(
  newUsername: string
): Promise<
  | { success: true; newUsername: string; oldUsername: string }
  | { success: false; error: string }
> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "You must be logged in." };

    // 1. Format validation
    const formatError = validateUsernameFormat(newUsername);
    if (formatError) return { success: false, error: formatError };

    const normalized = newUsername.trim().toLowerCase();

    // 2. Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, username: true },
    });
    if (!currentUser) return { success: false, error: "User not found." };

    // No change?
    if (currentUser.username.toLowerCase() === normalized) {
      return { success: false, error: "That is already your username." };
    }

    // 3. Uniqueness check — race-condition safe via DB unique constraint
    const existing = await prisma.user.findUnique({
      where: { username: newUsername.trim() },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: "That username is already taken." };
    }

    // 4. Update
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { username: newUsername.trim() },
      select: { username: true },
    });

    // 5. Revalidate old and new profile paths
    revalidatePath(`/profile/${currentUser.username}`);
    revalidatePath(`/profile/${updated.username}`);
    revalidatePath("/");

    return {
      success: true,
      newUsername: updated.username,
      oldUsername: currentUser.username,
    };
  } catch (error: unknown) {
    // Handle Prisma unique constraint violation (race condition)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false, error: "That username is already taken." };
    }
    console.error("Error updating username:", error);
    return { success: false, error: "Failed to update username. Please try again." };
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

/** Check if a username is available (for real-time validation in the UI) */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean; error?: string }> {
  const formatError = validateUsernameFormat(username);
  if (formatError) return { available: false, error: formatError };

  const existing = await prisma.user.findUnique({
    where: { username: username.trim() },
    select: { id: true },
  });

  return { available: !existing };
}

export async function getProfileFollowers(targetUserId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId || currentUserId !== targetUserId) {
      throw new Error("Unauthorized access to followers list");
    }

    const followers = await prisma.follows.findMany({
      where: { followingId: targetUserId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return followers.map((f) => f.follower);
  } catch (error) {
    console.error("Error in getProfileFollowers:", error);
    throw new Error("Failed to fetch followers list");
  }
}

export async function getProfileFollowing(targetUserId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId || currentUserId !== targetUserId) {
      throw new Error("Unauthorized access to following list");
    }

    const following = await prisma.follows.findMany({
      where: { followerId: targetUserId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return following.map((f) => f.following);
  } catch (error) {
    console.error("Error in getProfileFollowing:", error);
    throw new Error("Failed to fetch following list");
  }
}
