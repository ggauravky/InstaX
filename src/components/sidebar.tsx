import { currentUser } from "@clerk/nextjs/server";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { getUserByClerkId } from "@/actions/user.action";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { LinkIcon, MapPinIcon, LogInIcon, UserPlusIcon } from "lucide-react";

async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user.username}`}
              className="flex flex-col items-center justify-center"
            >
              {/* Priority: sidebar avatar is above the fold — eager load */}
              <Avatar className="w-20 h-20 border-2 border-border/40">
                <AvatarImage src={user.image || "/avatar.png"} />
              </Avatar>

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </Link>

            {user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}

            <div className="w-full">
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{user._count.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p className="font-medium">{user._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {user.location || "No location"}
              </div>
              <div className="flex items-center text-muted-foreground">
                <LinkIcon className="w-4 h-4 mr-2 shrink-0" />
                {user.website ? (
                  <a
                    href={`${user.website}`}
                    className="hover:underline truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.website}
                  </a>
                ) : (
                  "No website"
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Sidebar;

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card className="border-border/40 bg-card/65 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10">
          <LogInIcon className="size-5 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Welcome Back!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-xs text-muted-foreground mb-4 leading-relaxed">
          Log in to view post updates, comment on shared media, and follow creators.
        </p>
        <SignInButton mode="modal">
          <Button className="w-full cursor-pointer gap-2" variant="outline">
            <LogInIcon className="size-4" />
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full mt-2 cursor-pointer gap-2" variant="default">
            <UserPlusIcon className="size-4" />
            Sign Up
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);
