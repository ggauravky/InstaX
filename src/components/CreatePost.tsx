"use client";

import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  ImageIcon,
  Loader2Icon,
  SendIcon,
  XIcon,
  UploadCloudIcon,
} from "lucide-react";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import { useUploadThing } from "@/lib/uploadthing";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("postImage", {
    onClientUploadComplete: (res) => {
      const uploadedFile = res?.[0];
      const uploadedUrl =
        (uploadedFile as any)?.ufsUrl ||
        uploadedFile?.url ||
        (uploadedFile as any)?.serverData?.fileUrl;

      if (!uploadedUrl) {
        toast.error("Upload completed but no URL was returned");
        setIsUploading(false);
        return;
      }

      setImageUrl(uploadedUrl);
      setIsUploading(false);
      toast.success("Photo uploaded!");
    },
    onUploadError: (error) => {
      toast.error(error.message || "Failed to upload photo");
      setIsUploading(false);
      setSelectedFile(null);
    },
  });

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4MB");
      return;
    }
    setSelectedFile(file);
    setIsUploading(true);
    await startUpload([file]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveImage = () => {
    setImageUrl("");
    setSelectedFile(null);
    setShowImageUpload(false);
  };

  const toggleImageUpload = () => {
    if (imageUrl) return; // already uploaded, don't toggle
    setShowImageUpload((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;
    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        setContent("");
        setImageUrl("");
        setSelectedFile(null);
        setShowImageUpload(false);
        toast.success("Post created successfully!");
      } else {
        toast.error(result?.error ?? "Failed to create post");
      }
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const charCount = content.length;
  const maxChars = 280;
  const charPercent = Math.min((charCount / maxChars) * 100, 100);
  const charColor =
    charCount > maxChars
      ? "text-red-500"
      : charCount > maxChars * 0.85
      ? "text-yellow-500"
      : "text-muted-foreground";

  return (
    <Card className="mb-6 overflow-hidden border border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        {/* Top row: avatar + textarea */}
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0 ring-2 ring-border/40">
            <AvatarImage src={user?.imageUrl || "/avatar.png"} />
          </Avatar>

          <div className="flex-1 min-w-0">
            <Textarea
              id="create-post-textarea"
              placeholder="What's on your mind?"
              className="min-h-[90px] resize-none rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />

            {/* Image upload section */}
            {showImageUpload && (
              <div className="mt-3">
                {/* No image yet — show drop zone */}
                {!imageUrl && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      !isUploading &&
                      fileInputRef.current?.click()
                    }
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
                      py-8 px-4 cursor-pointer select-none transition-all duration-200
                      ${
                        isDragging
                          ? "border-primary bg-primary/8 scale-[1.01]"
                          : "border-border/60 bg-muted/15 hover:border-primary/50 hover:bg-muted/30"
                      }
                      ${isUploading ? "pointer-events-none opacity-70" : ""}
                    `}
                  >
                    {isUploading ? (
                      <>
                        <Loader2Icon className="size-7 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Uploading…</p>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full bg-primary/10 p-3">
                          <UploadCloudIcon className="size-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            PNG, JPG, GIF up to 4 MB
                          </p>
                        </div>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInputChange}
                      disabled={isUploading || isPosting}
                      id="post-image-input"
                    />
                  </div>
                )}

                {/* Uploaded image preview */}
                {imageUrl && (
                  <div className="relative group rounded-xl overflow-hidden border border-border/40">
                    <img
                      src={imageUrl}
                      alt="Post preview"
                      className="w-full max-h-80 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none rounded-xl" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-white transition-all duration-200 size-8"
                      onClick={handleRemoveImage}
                      disabled={isPosting}
                      aria-label="Remove photo"
                    >
                      <XIcon className="size-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-medium bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Photo attached
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom action bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  id="create-post-photo-btn"
                  className={`h-8 gap-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    showImageUpload || imageUrl
                      ? "text-primary bg-primary/10 hover:bg-primary/15"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/8"
                  }`}
                  onClick={toggleImageUpload}
                  disabled={isPosting}
                >
                  <ImageIcon className="size-4" />
                  Photo
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* Character counter */}
                {content.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {/* SVG ring indicator */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      className="rotate-[-90deg]"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-muted/40"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 8 * (1 - charPercent / 100)
                        }`}
                        strokeLinecap="round"
                        className={
                          charCount > maxChars
                            ? "text-red-500"
                            : charCount > maxChars * 0.85
                            ? "text-yellow-500"
                            : "text-primary"
                        }
                        style={{ transition: "stroke-dashoffset 0.2s ease" }}
                      />
                    </svg>
                    {charCount > maxChars * 0.75 && (
                      <span className={`text-xs tabular-nums ${charColor}`}>
                        {maxChars - charCount}
                      </span>
                    )}
                  </div>
                )}

                <Button
                  id="create-post-submit-btn"
                  size="sm"
                  className="h-8 px-4 gap-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                  onClick={handleSubmit}
                  disabled={
                    (!content.trim() && !imageUrl) ||
                    isPosting ||
                    isUploading ||
                    charCount > maxChars
                  }
                >
                  {isPosting ? (
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      Posting…
                    </>
                  ) : (
                    <>
                      <SendIcon className="size-3.5" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;
