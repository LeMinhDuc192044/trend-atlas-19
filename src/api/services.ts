import { apiFetch } from "@/lib/api-client";
import type {
  ApiResponse,
  BookmarkItem,
  ChartResponse,
  DashboardSummary,
  FollowSubscription,
  FollowTargetType,
  JournalListItem,
  NotificationItem,
  PagedResult,
  ResearchPaper,
  ResearchTopic,
  TopicTrend,
  TrendingTopic,
} from "./types";

const unwrap = <T>(response: ApiResponse<T>) => {
  if (!response.success) throw new Error(response.message || "Request failed");
  return response.data;
};

const params = (values: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(values).forEach(
    ([key, value]) => value !== undefined && value !== "" && query.set(key, String(value)),
  );
  const result = query.toString();
  return result ? `?${result}` : "";
};

const journalIdentity = (journal: JournalListItem) => {
  const issn = journal.issn?.replace(/[^0-9X]/gi, "").toUpperCase();
  if (issn) return `issn:${issn}`;
  return `fallback:${journal.title.trim().toLowerCase()}|${journal.publisher?.trim().toLowerCase() ?? ""}`;
};

const deduplicateJournals = (result: PagedResult<JournalListItem>) => {
  const unique = new Map<string, JournalListItem>();
  for (const journal of result.items) {
    const key = journalIdentity(journal);
    const current = unique.get(key);
    if (!current || journal.totalPapersPublished > current.totalPapersPublished) {
      unique.set(key, journal);
    }
  }
  const items = [...unique.values()];
  return {
    ...result,
    items,
  };
};

export const dashboardService = {
  summary: async () =>
    unwrap(await apiFetch<ApiResponse<DashboardSummary>>("/api/dashboard/summary")),
  publicationsByYear: async () =>
    unwrap(
      await apiFetch<ApiResponse<ChartResponse>>("/api/dashboard/charts/publications-by-year"),
    ),
  topKeywords: async (topCount = 6) =>
    unwrap(
      await apiFetch<ApiResponse<ChartResponse>>(
        `/api/dashboard/charts/top-keywords?topCount=${topCount}`,
      ),
    ),
};

export const paperService = {
  list: (
    filters: {
      query?: string;
      topicName?: string;
      fromYear?: number;
      toYear?: number;
      domain?: number;
      journalName?: string;
      pageNumber?: number;
      pageSize?: number;
    } = {},
  ) =>
    apiFetch<PagedResult<ResearchPaper>>(
      `/api/research-papers${params({ pageNumber: 1, pageSize: 12, ...filters })}`,
    ),
  detail: async (id: string) => {
    // The list DTO already contains the complete paper shape used by this UI.
    // Keeping lookup here also supports older backend builds whose detail mapper
    // cannot construct the positional ResearchPaperDto record.
    const firstPage = await apiFetch<PagedResult<ResearchPaper>>(
      "/api/research-papers?pageNumber=1&pageSize=100",
    );
    const firstMatch = firstPage.items.find((paper) => paper.id === id);
    if (firstMatch) return firstMatch;
    for (let pageNumber = 2; pageNumber <= firstPage.totalPages; pageNumber += 1) {
      const page = await apiFetch<PagedResult<ResearchPaper>>(
        `/api/research-papers?pageNumber=${pageNumber}&pageSize=100`,
      );
      const match = page.items.find((paper) => paper.id === id);
      if (match) return match;
    }
    throw new Error("Research paper not found");
  },
};

export const topicService = {
  list: async (search = "", pageNumber = 1, pageSize = 24) =>
    unwrap(
      await apiFetch<ApiResponse<PagedResult<ResearchTopic>>>(
        `/api/research-topics${params({ search, pageNumber, pageSize })}`,
      ),
    ),
  detail: (id: string) => apiFetch<ResearchTopic>(`/api/research-topics/${id}`),
  trend: async (id: string) =>
    unwrap(await apiFetch<ApiResponse<TopicTrend>>(`/api/trends/topics/${id}`)),
  trending: async (topCount = 6) =>
    unwrap(
      await apiFetch<ApiResponse<{ items: TrendingTopic[] }>>(
        `/api/trends/trending-topics?topCount=${topCount}`,
      ),
    ),
};

export const journalService = {
  list: async (search = "", pageNumber = 1, pageSize = 30) =>
    deduplicateJournals(
      unwrap(
        await apiFetch<ApiResponse<PagedResult<JournalListItem>>>(
          `/api/journals${params({ search, pageNumber, pageSize })}`,
        ),
      ),
    ),
};

export const followSubscriptionService = {
  listMine: async (targetType?: FollowTargetType) =>
    unwrap(
      await apiFetch<ApiResponse<PagedResult<FollowSubscription>>>(
        `/api/follow-subscriptions/me${params({ targetType, pageNumber: 1, pageSize: 100 })}`,
      ),
    ),
  follow: async (targetType: FollowTargetType, targetId: string) =>
    unwrap(
      await apiFetch<ApiResponse<FollowSubscription>>("/api/follow-subscriptions", {
        method: "POST",
        body: JSON.stringify({ targetType, targetId }),
      }),
    ),
  unfollow: (subscriptionId: string) =>
    apiFetch(`/api/follow-subscriptions/${subscriptionId}`, { method: "DELETE" }),
};

export const bookmarkService = {
  list: async () =>
    unwrap(
      await apiFetch<ApiResponse<{ items: BookmarkItem[]; totalCount: number }>>("/api/bookmarks"),
    ),
  createPaper: async (researchPaperId: string) =>
    unwrap(
      await apiFetch<ApiResponse<BookmarkItem>>("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify({ type: 0, researchPaperId }),
      }),
    ),
  remove: (id: string) => apiFetch(`/api/bookmarks/${id}`, { method: "DELETE" }),
};

export const notificationService = {
  list: async (isRead?: boolean) =>
    unwrap(
      await apiFetch<ApiResponse<PagedResult<NotificationItem>>>(
        `/api/notifications${params({ isRead: isRead === undefined ? undefined : String(isRead), pageSize: 50 })}`,
      ),
    ),
  markRead: async (id: string) =>
    unwrap(
      await apiFetch<ApiResponse<NotificationItem>>(`/api/notifications/${id}/read`, {
        method: "PUT",
      }),
    ),
};
