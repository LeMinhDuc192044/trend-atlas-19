import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  type FollowTargetType,
  useFollowSubscription,
  useFollowTarget,
  useUnfollowTarget,
} from "@/features/follow-subscriptions/api/follow-subscription-api";

export function FollowButton({
  targetType,
  targetId,
  label,
}: {
  targetType: FollowTargetType;
  targetId?: string;
  label: string;
}) {
  const { data: subscription, error: subscriptionError, isLoading } = useFollowSubscription(targetType, targetId);
  const follow = useFollowTarget();
  const unfollow = useUnfollowTarget();
  const isFollowing = Boolean(subscription?.id);
  const isPending = isLoading || follow.isPending || unfollow.isPending;
  const error = subscriptionError ?? follow.error ?? unfollow.error;

  const toggleFollow = () => {
    if (!targetId) return;
    if (subscription?.id) {
      unfollow.mutate({ subscriptionId: subscription.id, targetType, targetId });
      return;
    }
    follow.mutate({ targetType, targetId });
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={!targetId || isPending}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
          isFollowing
            ? "border border-border bg-background text-foreground hover:bg-secondary"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isFollowing ? (
          <BellOff className="size-3.5" />
        ) : (
          <Bell className="size-3.5" />
        )}
        {isFollowing ? `Unfollow ${label}` : `Follow ${label}`}
      </button>
      {error ? (
        <span className="max-w-64 text-xs text-destructive">
          {(error as Error).message}
        </span>
      ) : null}
    </div>
  );
}
