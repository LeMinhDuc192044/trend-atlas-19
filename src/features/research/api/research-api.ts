import { apiClient, unwrapApiResponse } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ResearchTopicListItemDto = components["schemas"]["ResearchTopicListItemDto"];
export type ResearchTopicDto = components["schemas"]["ResearchTopicDto"];
export type ResearchPaperDto = components["schemas"]["ResearchPaperDto"];
export type PagedResearchPapers = components["schemas"]["PagedResultOfResearchPaperDto"];
export type JournalListItemDto = components["schemas"]["JournalListItemDto"];
export type ResearchDomain = components["schemas"]["ResearchDomain"];
export type ImportSinglePaperResult = components["schemas"]["ImportSinglePaperResult"];
export type ImportResearchPaperByLinkCommand = components["schemas"]["ImportResearchPaperByLinkCommand"];

export type ResearchPaperSearchParams = {
  query?: string;
  topicName?: string;
  pageNumber?: number;
  pageSize?: number;
  fromYear?: number;
  toYear?: number;
  apiSource?: string;
  domain?: ResearchDomain;
  authorName?: string;
  journalName?: string;
  enabled?: boolean;
};

export function useResearchTopics() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["research", "topics"],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/trends/topics");
      if (error) throw error;
      const unwrapped = unwrapApiResponse<ResearchTopicListItemDto[] | { items?: ResearchTopicListItemDto[] | null }>(data);
      if (Array.isArray(unwrapped)) return unwrapped;
      if (unwrapped && typeof unwrapped === "object" && Array.isArray(unwrapped.items)) return unwrapped.items;
      return [];
    },
  });
}

export function useImportPaperByLink() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ImportResearchPaperByLinkCommand) => {
      if (!token) throw new Error("You must be signed in to import a paper.");

      const { data, error } = await apiClient.POST("/api/research-papers/import-single", {
        body: payload,
      });
      if (error) throw error;
      return data as ImportSinglePaperResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research", "papers"] });
    },
  });
} 

export function useResearchTopic(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["research", "topics", id],
    enabled: Boolean(token && id),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/research-topics/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
      return data as ResearchTopicDto;
    },
  });
}

export function useResearchPapers(params: ResearchPaperSearchParams) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["research", "papers", params],
    enabled: Boolean(token && (params.enabled ?? true)),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/research-papers", {
        params: {
          query: {
            Query: params.query || undefined,
            TopicName: params.topicName || undefined,
            PageNumber: params.pageNumber,
            PageSize: params.pageSize,
            FromYear: params.fromYear,
            ToYear: params.toYear,
            ApiSource: params.apiSource || undefined,
            Domain: params.domain,
            AuthorName: params.authorName || undefined,
            JournalName: params.journalName || undefined,
          },
        },
      });
      if (error) throw error;
      return data as PagedResearchPapers;
    },
  });
}

export function useResearchPaper(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["research", "papers", id],
    enabled: Boolean(token && id),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/research-papers/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
      return unwrapApiResponse<ResearchPaperDto>(data);
    },
  });
}

export function useJournals() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["research", "journals"],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/journals");
      if (error) throw error;
      return unwrapApiResponse<JournalListItemDto[]>(data) ?? [];
    },
  });
}

export function useJournal(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["research", "journals", id],
    enabled: Boolean(token && id),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/journals/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
      return unwrapApiResponse<JournalListItemDto>(data);
    },
  });
}
