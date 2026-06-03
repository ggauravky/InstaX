// Server Component — data is fetched on the server, no waterfall
import { getNotifications } from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Suspense } from "react";
import { NotificationsClient } from "./NotificationsClient";

export const dynamic = "force-dynamic";

// This is a Server Component — no "use client" directive
async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsClient notifications={notifications} />
    </Suspense>
  );
}

export default NotificationsPage;
