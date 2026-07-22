import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellPlus, BellRing, LogIn } from "lucide-react";
import { toast } from "sonner";
import { followSubscriptionService } from "@/api/services";
import type { FollowTargetType } from "@/api/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function FollowButton({
  targetType,
  targetId,
}: {
  targetType: FollowTargetType;
  targetId: string;
}) {
  const { user, authLoading } = useAuth();
  const queryClient = useQueryClient();
  const follows = useQuery({
    queryKey: ["follow-subscriptions", targetType],
    queryFn: () => followSubscriptionService.listMine(targetType),
    enabled: Boolean(user),
    retry: false,
  });
  const subscription = follows.data?.items.find(
    (item) => item.targetId === targetId && item.isActive,
  );
  const mutation = useMutation({
    mutationFn: () =>
      subscription
        ? followSubscriptionService.unfollow(subscription.id)
        : followSubscriptionService.follow(targetType, targetId),
    onSuccess: async () => {
      toast.success(subscription ? "Unfollowed successfully" : "Following successfully");
      await queryClient.invalidateQueries({ queryKey: ["follow-subscriptions"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (authLoading)
    return (
      <Button variant="outline" disabled>
        Loading account…
      </Button>
    );
  if (!user) {
    return (
      <Button variant="outline" onClick={() => toast.info("Sign in to follow this item")}>
        <LogIn data-icon="inline-start" /> Sign in to follow
      </Button>
    );
  }
  return (
    <Button
      variant={subscription ? "secondary" : "default"}
      disabled={follows.isLoading || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {subscription ? <BellRing data-icon="inline-start" /> : <BellPlus data-icon="inline-start" />}
      {mutation.isPending ? "Updating…" : subscription ? "Unfollow" : "Follow"}
    </Button>
  );
}
