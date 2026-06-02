"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import { UploadDropzone } from "@/lib/uploadthing";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);

    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        //reset the form
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);

        toast.success("Post created successfully");
      } else {
        toast.error(result?.error ?? "Failed to create post");
      }
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setShowImageUpload(false);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[100px] flex-1 resize-none rounded-md border border-border bg-muted/30 px-3 py-2 text-base focus-visible:ring-1 focus-visible:ring-ring"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>
          {/* handle image uploads */}
          {showImageUpload && !imageUrl && (
            <UploadDropzone
              endpoint="postImage"
              onClientUploadComplete={(res) => {
                const uploadedFile = res[0];
                const uploadedUrl =
                  uploadedFile?.ufsUrl || uploadedFile?.url || uploadedFile?.serverData?.fileUrl;

                if (!uploadedUrl) {
                  toast.error("Upload completed, but no image URL was returned");
                  return;
                }

                setImageUrl(uploadedUrl);
                toast.success("Photo uploaded successfully");
              }}
              onUploadError={(error) => {
                toast.error(error.message || "Failed to upload photo");
              }}
              appearance={{
                container:
                  "mx-auto flex h-32 min-h-0 w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-center transition-colors ut-ready:hover:border-primary/60 ut-uploading:pointer-events-none ut-uploading:opacity-70 sm:h-36 sm:max-w-md",
                uploadIcon: "size-8 text-muted-foreground sm:size-9",
                label: "max-w-[14rem] text-center text-sm font-medium leading-5 text-foreground",
                allowedContent: "text-center text-xs leading-4 text-muted-foreground",
                button:
                  "h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring",
              }}
              content={{
                label: "Drop a photo here or click to choose",
                allowedContent: "Image up to 4MB",
                button: "Upload photo",
              }}
            />
          )}

          {imageUrl && (
            <div className="relative overflow-hidden rounded-md border">
              <img
                src={imageUrl}
                alt="Post upload preview"
                className="max-h-80 w-full object-cover sm:max-h-96"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemoveImage}
                disabled={isPosting}
              >
                <XIcon className="size-4" />
                <span className="sr-only">Remove photo</span>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;
