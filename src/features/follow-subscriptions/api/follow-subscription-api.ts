import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, unwrapApiResponse, type ApiResponse } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/auth-store";

export type FollowTargetType = "Journal" | "ResearchTopic";

export type FollowSubscriptionDto = {
  id?: string;
  targetType?: FollowTargetType | 0 | 1;
  targetId?: string;
  targetName?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type FollowSubscriptionListResponse = {
  items?: FollowSubscriptionDto[] | null;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
};

export function useFollowSubscription(targetType: FollowTargetType, targetId?: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["follow-subscriptions", targetType, targetId],
    enabled: Boolean(token && targetId),
    queryFn: async () => {
      const query = new URLSearchParams({
        targetType,
        pageSize: "100",
      });
      const response = await apiFetch<ApiResponse<FollowSubscriptionListResponse>>(
        `/api/follow-subscriptions/me?${query}`,
      );
      const list = unwrapApiResponse<FollowSubscriptionListResponse>(response);
      return list?.items?.find((subscription) => subscription.targetId === targetId && subscription.isActive) ?? null;
    },
  });
}

export function useFollowTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: FollowTargetType; targetId: string }) => {
      const response = await apiFetch<ApiResponse<FollowSubscriptionDto>>("/api/follow-subscriptions", {
        method: "POST",
        body: JSON.stringify({ targetType, targetId }),
      });
      return unwrapApiResponse<FollowSubscriptionDto>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["follow-subscriptions", variables.targetType, variables.targetId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUnfollowTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      targetType,
      targetId,
    }: {
      subscriptionId: string;
      targetType: FollowTargetType;
      targetId: string;
    }) => {
      await apiFetch<ApiResponse<unknown>>(`/api/follow-subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });
      return { targetType, targetId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ["follow-subscriptions", variables.targetType, variables.targetId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
