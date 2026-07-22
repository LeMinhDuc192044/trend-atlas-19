import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { USE_MOCK_DATA } from "./api-client";
import { papers } from "./mock-data";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/model/auth-store";

export type BookmarkType = components["schemas"]["BookmarkType"];
export type BookmarkDto = components["schemas"]["BookmarkDto"];
export type BookmarkListResponse = components["schemas"]["BookmarkListResponse"];
export type AnalyticalReportDto = components["schemas"]["AnalyticalReportDto"];

// Bookmarks Hooks
export function useBookmarks() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["bookmarks"],
    enabled: USE_MOCK_DATA || Boolean(token),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Return simulated mock response
        const mockBookmarksStr = localStorage.getItem("mock_bookmarks") || "[]";
        const mockIds = JSON.parse(mockBookmarksStr) as string[];
        
        const items: BookmarkDto[] = mockIds.map(id => {
          const paper = papers.find(p => p.id === id);
          return {
            id: `bm-${id}`,
            type: 0,
            researchPaperId: id,
            paperTitle: paper?.title || "Unknown Paper",
            createdAt: new Date().toISOString()
          };
        });
        
        return {
          items,
          totalCount: items.length
        } as BookmarkListResponse;
      }
      
      const { data, error } = await apiClient.GET("/api/bookmarks");
      if (error) throw error;
      return unwrapApiResponse<BookmarkListResponse>(data);
    }
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paperId, title }: { paperId: string, title?: string }) => {
      if (USE_MOCK_DATA) {
        const mockBookmarksStr = localStorage.getItem("mock_bookmarks") || "[]";
        const mockIds = new Set(JSON.parse(mockBookmarksStr) as string[]);
        mockIds.add(paperId);
        localStorage.setItem("mock_bookmarks", JSON.stringify(Array.from(mockIds)));
        return { id: `bm-${paperId}` };
      }
      
      const { data, error } = await apiClient.POST("/api/bookmarks", {
        body: {
          type: 0,
          researchPaperId: paperId,
        },
      });
      if (error) throw error;
      return unwrapApiResponse<BookmarkDto>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark saved successfully");
    },
    onError: (err) => {
      toast.error("Failed to save bookmark: " + (err as Error).message);
    }
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paperId, bookmarkId }: { paperId?: string, bookmarkId?: string }) => {
      if (USE_MOCK_DATA) {
        const mockBookmarksStr = localStorage.getItem("mock_bookmarks") || "[]";
        const mockIds = new Set(JSON.parse(mockBookmarksStr) as string[]);
        if (paperId) mockIds.delete(paperId);
        if (bookmarkId) mockIds.delete(bookmarkId.replace("bm-", ""));
        localStorage.setItem("mock_bookmarks", JSON.stringify(Array.from(mockIds)));
        return true;
      }
      
      // If we only have paperId, we need to find the bookmarkId first. In real API, we usually pass bookmarkId directly.
      if (!bookmarkId) throw new Error("bookmarkId is required for real API");
      
      const { data, error } = await apiClient.DELETE("/api/bookmarks/{id}", {
        params: {
          path: { id: bookmarkId },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark removed");
    },
    onError: (err) => {
      toast.error("Failed to remove bookmark: " + (err as Error).message);
    }
  });
}

// Reports Hooks
export function useReportSummary() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["reportSummary"],
    enabled: USE_MOCK_DATA || Boolean(token),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return {
          id: "mock-report",
          title: "Weekly Insight Report",
          description: "Academic output in Reinforcement Learning has shifted from gaming environments to physical robotics control systems this quarter.",
          totalPapersCount: 15420,
          totalBookmarksCount: 84,
          generatedAt: new Date().toISOString()
        } as AnalyticalReportDto;
      }
      
      const { data, error } = await apiClient.GET("/api/reports/summary");
      if (error) throw error;
      return unwrapApiResponse<AnalyticalReportDto>(data);
    }
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(r => setTimeout(r, 1500)); // Simulate generation time
        return { id: "mock-new-report" };
      }
      
      const { data, error } = await apiClient.POST("/api/reports/generate", {
        body: { title: "Exported Analytical Report" },
      });
      if (error) throw error;
      return unwrapApiResponse<AnalyticalReportDto>(data);
    },
    onSuccess: () => {
      toast.success("Analytical report generated successfully!");
    },
    onError: (err) => {
      toast.error("Failed to generate report: " + (err as Error).message);
    }
  });
}
