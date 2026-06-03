import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { username: true },
  });

  if (!dbUser) {
    redirect("/");
  }

  redirect(`/profile/${dbUser.username}`);
}
