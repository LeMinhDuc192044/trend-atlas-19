import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, unwrapApiResponse, type ApiResponse } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/auth-store";

export type NotificationType = 0 | 1 | 2 | 3 | "NewPaperPublished" | "TrendingTopicAlert" | "JournalUpdate" | "SystemNotification";

export type NotificationDto = {
  id?: string;
  type?: NotificationType;
  title?: string | null;
  message?: string | null;
  relatedPaperId?: string | null;
  relatedPaperTitle?: string | null;
  relatedJournalId?: string | null;
  relatedJournalTitle?: string | null;
  relatedResearchTopicId?: string | null;
  relatedResearchTopicName?: string | null;
  isRead?: boolean;
  createdAt?: string;
};

export type NotificationListResponse = {
  items?: NotificationDto[];
  totalCount?: number;
  unreadCount?: number;
};

export type NotificationUnreadCountResponse = {
  unreadCount?: number;
};

export function useNotifications(params: { isRead?: boolean; pageNumber?: number; pageSize?: number } = {}) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["notifications", params],
    enabled: Boolean(token),
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.isRead !== undefined) query.set("isRead", String(params.isRead));
      if (params.pageNumber) query.set("pageNumber", String(params.pageNumber));
      if (params.pageSize) query.set("pageSize", String(params.pageSize));

      const response = await apiFetch<ApiResponse<NotificationListResponse>>(`/api/notifications?${query}`);
      return unwrapApiResponse<NotificationListResponse>(response) ?? { items: [], totalCount: 0, unreadCount: 0 };
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch<ApiResponse<NotificationDto>>(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      return unwrapApiResponse<NotificationDto>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const cachedPages = queryClient.getQueriesData<NotificationListResponse>({ queryKey: ["notifications"] });
      const unreadIds = cachedPages
        .flatMap(([, page]) => page?.items ?? [])
        .filter((notification) => notification.id && !notification.isRead)
        .map((notification) => notification.id!);

      await Promise.all(
        [...new Set(unreadIds)].map((id) =>
          apiFetch<ApiResponse<NotificationDto>>(`/api/notifications/${id}/read`, {
            method: "PUT",
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
