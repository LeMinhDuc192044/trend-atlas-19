import { Link, createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/app/layouts/main-layout";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  type NotificationDto,
} from "@/features/notifications/api/notification-api";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { DateDisplay } from "@/shared/ui/custom-date";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Scigraph" },
      { name: "description", content: "Alerts about newly published papers in your followed journals and topics." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { data, isLoading, isError, error } = useNotifications({ pageSize: 50 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const notifications = data?.items ?? [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl mb-1">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              {unreadCount.toLocaleString()} unread updates from your account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            {markAllAsRead.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
            Mark all read
          </button>
        </div>

        {isLoading ? (
          <State label="Loading notifications..." />
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-destructive">
            Failed to load notifications: {(error as Error).message}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">New account and research updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markAsRead.mutate(id)}
                isMarking={markAsRead.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: NotificationDto;
  onMarkRead: (id: string) => void;
  isMarking: boolean;
}) {
  const unread = !notification.isRead;

  return (
    <article className={`bg-surface border rounded-2xl p-5 flex gap-4 ${unread ? "border-brand/40" : "border-border"}`}>
      <div className={`size-9 rounded-full grid place-items-center shrink-0 ${unread ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"}`}>
        <Bell className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm">{notification.title || "Notification"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{notification.message || "No message provided."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {notification.relatedPaperId && notification.relatedPaperTitle ? (
                <Link
                  to="/papers/$id"
                  params={{ id: notification.relatedPaperId }}
                  className="rounded-full border border-border px-2.5 py-1 font-medium text-brand hover:bg-secondary"
                >
                  Paper: {notification.relatedPaperTitle}
                </Link>
              ) : null}
              {notification.relatedJournalId && notification.relatedJournalTitle ? (
                <Link
                  to="/journals/$id"
                  params={{ id: notification.relatedJournalId }}
                  className="rounded-full border border-border px-2.5 py-1 font-medium text-brand hover:bg-secondary"
                >
                  Journal: {notification.relatedJournalTitle}
                </Link>
              ) : null}
              {notification.relatedResearchTopicId && notification.relatedResearchTopicName ? (
                <Link
                  to="/topics/$id"
                  params={{ id: notification.relatedResearchTopicId }}
                  className="rounded-full border border-border px-2.5 py-1 font-medium text-brand hover:bg-secondary"
                >
                  Topic: {notification.relatedResearchTopicName}
                </Link>
              ) : null}
            </div>
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
            <DateDisplay value={notification.createdAt} />
          </span>
        </div>
        {unread && notification.id ? (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id!)}
            disabled={isMarking}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </article>
  );
}

function State({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}
