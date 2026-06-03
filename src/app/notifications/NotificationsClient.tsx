"use client";

import { markNotificationsAsRead } from "@/actions/notification.action";
import { getNotifications } from "@/actions/notification.action";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;

interface NotificationsClientProps {
  notifications: Notifications;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-4 text-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-green-500" />;
    default:
      return null;
  }
};

export function NotificationsClient({ notifications }: NotificationsClientProps) {
  const markedRef = useRef(false);

  // Mark unread notifications as read once — only runs on mount, not on re-renders
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      markNotificationsAsRead(unreadIds);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <Avatar className="mt-1 shrink-0">
                    <AvatarImage
                      src={notification.creator.image ?? "/avatar.png"}
                    />
                  </Avatar>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getNotificationIcon(notification.type)}
                      <span>
                        <span className="font-medium">
                          {notification.creator.name ?? notification.creator.username}
                        </span>{" "}
                        {notification.type === "FOLLOW"
                          ? "started following you"
                          : notification.type === "LIKE"
                          ? "liked your post"
                          : "commented on your post"}
                      </span>
                    </div>

                    {notification.post &&
                      (notification.type === "LIKE" ||
                        notification.type === "COMMENT") && (
                        <div className="pl-6 space-y-2">
                          <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                            <p className="truncate">{notification.post.content}</p>
                            {notification.post.image && (
                              <div className="relative mt-2 w-full max-w-[200px] h-24 overflow-hidden rounded-md">
                                <Image
                                  src={notification.post.image}
                                  alt="Post content"
                                  fill
                                  sizes="200px"
                                  className="object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </div>

                          {notification.type === "COMMENT" && notification.comment && (
                            <div className="text-sm p-2 bg-accent/50 rounded-md">
                              {notification.comment.content}
                            </div>
                          )}
                        </div>
                      )}

                    <p className="text-sm text-muted-foreground pl-6">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
