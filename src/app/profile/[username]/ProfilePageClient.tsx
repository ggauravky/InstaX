"use client";

import type { getProfileByUsername, getUserPosts } from "@/actions/profile.action";
import {
  updateProfile,
  updateUsername,
  checkUsernameAvailability,
  getProfileFollowers,
  getProfileFollowing,
} from "@/actions/profile.action";
import { validateUsernameFormat } from "@/lib/username";
import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  Loader2Icon,
  LinkIcon,
  MapPinIcon,
  XCircleIcon,
  Search,
  Users,
  ChevronRight,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

// ─── Username field with real-time validation ────────────────────────────────

interface UsernameFieldProps {
  value: string;
  currentUsername: string;
  onChange: (v: string) => void;
}

const UsernameField = memo(function UsernameField({
  value,
  currentUsername,
  onChange,
}: UsernameFieldProps) {
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = value.trim();

    // Same as current — no check needed
    if (trimmed.toLowerCase() === currentUsername.toLowerCase()) {
      setStatus("idle");
      setErrorMsg("");
      return;
    }

    if (!trimmed) {
      setStatus("idle");
      setErrorMsg("");
      return;
    }

    // Client-side format check first (instant feedback, no server round-trip)
    const formatErr = validateUsernameFormat(trimmed);
    if (formatErr) {
      setStatus("invalid");
      setErrorMsg(formatErr);
      return;
    }

    // Debounce the server uniqueness check
    setStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameAvailability(trimmed);
      if (result.available) {
        setStatus("available");
        setErrorMsg("");
      } else {
        setStatus("taken");
        setErrorMsg(result.error ?? "Username not available");
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, currentUsername]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="edit-username">Username</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
          @
        </span>
        <Input
          id="edit-username"
          name="username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={currentUsername}
          className="pl-7 pr-8"
          autoComplete="off"
          spellCheck={false}
        />
        {/* Status icon */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {status === "checking" && (
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          )}
          {status === "available" && (
            <CheckCircle2Icon className="size-4 text-green-500" />
          )}
          {(status === "taken" || status === "invalid") && (
            <XCircleIcon className="size-4 text-destructive" />
          )}
        </div>
      </div>
      {(status === "taken" || status === "invalid") && errorMsg && (
        <p className="text-xs text-destructive mt-1">{errorMsg}</p>
      )}
      {status === "available" && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          ✓ Username is available
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        3–30 characters. Letters, numbers, underscores only.
      </p>
    </div>
  );
});

// ─── Edit Profile Dialog ─────────────────────────────────────────────────────

interface EditDialogProps {
  user: NonNullable<User>;
  open: boolean;
  onClose: () => void;
}

const EditDialog = memo(function EditDialog({ user, open, onClose }: EditDialogProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [usernameValue, setUsernameValue] = useState(user.username);
  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      });
      setUsernameValue(user.username);
    }
  }, [open, user]);

  const handleFieldChange = useCallback(
    (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const trimmedUsername = usernameValue.trim();
      const usernameChanged =
        trimmedUsername.toLowerCase() !== user.username.toLowerCase();

      // Save profile fields
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      const profileResult = await updateProfile(formData);

      if (!profileResult.success) {
        toast.error(profileResult.error ?? "Failed to update profile");
        return;
      }

      // Save username if changed
      if (usernameChanged && trimmedUsername) {
        const usernameResult = await updateUsername(trimmedUsername);
        if (!usernameResult.success) {
          toast.error(usernameResult.error ?? "Failed to update username");
          return;
        }
        toast.success("Profile & username updated!");
        onClose();
        // Redirect to new username URL
        router.push(`/profile/${usernameResult.newUsername}`);
        return;
      }

      toast.success("Profile updated successfully!");
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, usernameValue, user.username, form, onClose, router]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Username */}
          <UsernameField
            value={usernameValue}
            currentUsername={user.username}
            onChange={setUsernameValue}
          />

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              name="bio"
              value={form.bio}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              name="location"
              value={form.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder="Where are you based?"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              name="website"
              value={form.website}
              onChange={(e) => handleFieldChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2Icon className="size-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// ─── Main Profile Page ───────────────────────────────────────────────────────

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);

  const openFollowModal = useCallback(
    (type: "followers" | "following") => {
      setFollowModalType(type);
    },
    []
  );

  const closeFollowModal = useCallback(() => {
    setFollowModalType(null);
  }, []);

  // Memoized derived values — not recomputed on every render
  const isOwnProfile = useMemo(
    () => currentUser?.id === user.clerkId,
    [currentUser?.id, user.clerkId]
  );

  const formattedDate = useMemo(
    () => format(new Date(user.createdAt), "MMMM yyyy"),
    [user.createdAt]
  );

  const handleFollow = useCallback(async () => {
    if (!currentUser || isUpdatingFollow) return;
    try {
      setIsUpdatingFollow(true);
      setIsFollowing((prev) => !prev); // Optimistic update
      await toggleFollow(user.id);
    } catch {
      setIsFollowing(isFollowing); // Revert on error
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  }, [currentUser, isUpdatingFollow, isFollowing, user.id]);

  const openEdit = useCallback(() => setShowEditDialog(true), []);
  const closeEdit = useCallback(() => setShowEditDialog(false), []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Avatar */}
                <Avatar className="w-24 h-24 ring-2 ring-border/40">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>

                <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <div
                      className={isOwnProfile ? "cursor-pointer group select-none flex-1 text-center" : "select-none flex-1 text-center"}
                      onClick={isOwnProfile ? () => openFollowModal("following") : undefined}
                    >
                      <div className={`font-semibold ${isOwnProfile ? "group-hover:text-primary transition-colors" : ""}`}>
                        {user._count.following.toLocaleString()}
                      </div>
                      <div className={`text-sm text-muted-foreground ${isOwnProfile ? "group-hover:underline" : ""}`}>
                        Following
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div
                      className={isOwnProfile ? "cursor-pointer group select-none flex-1 text-center" : "select-none flex-1 text-center"}
                      onClick={isOwnProfile ? () => openFollowModal("followers") : undefined}
                    >
                      <div className={`font-semibold ${isOwnProfile ? "group-hover:text-primary transition-colors" : ""}`}>
                        {user._count.followers.toLocaleString()}
                      </div>
                      <div className={`text-sm text-muted-foreground ${isOwnProfile ? "group-hover:underline" : ""}`}>
                        Followers
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="select-none flex-1 text-center">
                      <div className="font-semibold">
                        {user._count.posts.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* FOLLOW / EDIT PROFILE BUTTONS */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button className="w-full mt-4" onClick={openEdit}>
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isUpdatingFollow ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : isFollowing ? (
                      "Unfollow"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2 shrink-0" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2 shrink-0" />
                      <a
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `https://${user.website}`
                        }
                        className="hover:underline truncate"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2 shrink-0" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts / Likes Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No liked posts to show
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog — rendered separately to avoid re-rendering the profile card */}
      <EditDialog user={user} open={showEditDialog} onClose={closeEdit} />

      {/* Follower/Following list dialog */}
      <FollowListModal
        userId={user.id}
        type={followModalType}
        onClose={closeFollowModal}
      />
    </div>
  );
}

type FollowUser = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
};

interface FollowListModalProps {
  userId: string;
  type: "followers" | "following" | null;
  onClose: () => void;
}

const FollowListModal = memo(function FollowListModal({
  userId,
  type,
  onClose,
}: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!type) {
      setUsers([]);
      setSearchQuery("");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data =
          type === "followers"
            ? await getProfileFollowers(userId)
            : await getProfileFollowing(userId);

        if (Array.isArray(data)) {
          setUsers(data as FollowUser[]);
        } else {
          setError("Failed to load list.");
        }
      } catch (err) {
        console.error("Error fetching follow list:", err);
        setError("Failed to load list.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, userId]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(query)) ||
        u.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <Dialog open={type !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] sm:w-[90%] md:w-full md:max-w-[500px] h-[80vh] md:h-auto md:max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/40">
        <DialogHeader className="p-4 border-b border-border/20 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-lg font-bold capitalize">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        {type && !error && (
          <div className="p-3 border-b border-border/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${type === "followers" ? "followers" : "following"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                <div className="size-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-3.5 w-20 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-3 rounded-full bg-muted/30">
                <Users className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {searchQuery
                    ? "No matches found"
                    : type === "followers"
                    ? "No followers yet."
                    : "Not following anyone yet."}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
                  {searchQuery
                    ? "Try checking the spelling or query parameters."
                    : type === "followers"
                    ? "When people follow this profile, they will appear here."
                    : "When this profile follows other creators, they will appear here."}
                </p>
              </div>
            </div>
          ) : (
            filteredUsers.map((item) => (
              <Link
                key={item.id}
                href={`/profile/${item.username}`}
                onClick={onClose}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-accent/40 active:bg-accent/60 transition-all cursor-pointer group text-left min-w-0"
              >
                <Avatar className="size-10 shrink-0 border border-border/20">
                  <AvatarImage src={item.image ?? "/avatar.png"} />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {item.name || item.username}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{item.username}
                  </div>
                  {item.bio && (
                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5 max-w-[90%]">
                      {item.bio}
                    </p>
                  )}
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ProfilePageClient;
