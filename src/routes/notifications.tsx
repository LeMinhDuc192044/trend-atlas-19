import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Bell, Check, LogIn } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService } from "@/api/services";
import { useAuth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const { user, authLoading } = useAuth();
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
    enabled: Boolean(user),
    retry: false,
  });
  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-5 md:p-8">
        <div>
          <h1 className="font-serif text-4xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates from followed journals and research topics.
          </p>
        </div>
        {authLoading ? (
          <Skeleton className="h-28 rounded-xl" />
        ) : !user ? (
          <Alert>
            <LogIn />
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              <Link to="/auth" className="font-medium text-brand hover:underline">
                Sign in
              </Link>{" "}
              to view your personalized updates.
            </AlertDescription>
          </Alert>
        ) : notifications.isLoading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : notifications.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load notifications</AlertTitle>
            <AlertDescription>{notifications.error.message}</AlertDescription>
          </Alert>
        ) : notifications.data?.items.length ? (
          <div className="flex flex-col gap-3">
            {notifications.data.items.map((item) => (
              <Card
                key={item.id}
                className={`flex gap-4 p-5 ${item.isRead ? "opacity-70" : "border-brand/40"}`}
              >
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${item.isRead ? "bg-secondary text-muted-foreground" : "bg-brand text-brand-foreground"}`}
                >
                  <Bell />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold">{item.title}</h2>
                    <time className="font-mono text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!item.isRead ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(item.id)}
                      >
                        <Check data-icon="inline-start" /> Mark as read
                      </Button>
                    ) : null}
                    {notificationLink(item) ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link {...notificationLink(item)!}>
                          <ArrowUpRight data-icon="inline-end" /> Open related item
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            You are all caught up.
          </div>
        )}
  const { data, isLoading, isError, error } = useNotifications({ pageSize: 50 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

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

function notificationLink(item: {
  relatedPaperId?: string;
  relatedJournalId?: string;
  relatedResearchTopicId?: string;
}) {
  if (item.relatedPaperId)
    return { to: "/papers/$id" as const, params: { id: item.relatedPaperId } };
  if (item.relatedJournalId)
    return { to: "/journals/$id" as const, params: { id: item.relatedJournalId } };
  if (item.relatedResearchTopicId)
    return { to: "/topics/$id" as const, params: { id: item.relatedResearchTopicId } };
  return null;
}
