"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, image: true, username: true },
    });

    const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    if (existingUser) {
      const nameChanged = existingUser.name !== clerkName;
      const imageChanged = existingUser.image !== user.imageUrl;

      if (nameChanged || imageChanged) {
        const updatedUser = await prisma.user.update({
          where: { clerkId: userId },
          data: {
            name: clerkName,
            image: user.imageUrl,
          },
        });

        return updatedUser;
      }

      return existingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser", error);
  }
}

// Full user data including counts — used by Sidebar
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

// Lean version — only fetches id, used by server actions that just need userId
async function getUserIdByClerkId(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const userId = await getUserIdByClerkId(clerkId);
  if (!userId) throw new Error("User not found");

  return userId;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: { followerId: userId },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: { followers: true },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.error("Error fetching random users", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.follows.create({
          data: { followerId: userId, followingId: targetUserId },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId,
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}
