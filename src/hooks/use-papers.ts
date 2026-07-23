import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPapers,
  searchPapers,
  getPaperById,
  importPapers,
  importSinglePaper,
  type GetAllPapersRequest,
  type SearchPapersRequest,
  type ImportPapersRequest,
  type ImportSinglePaperRequest,
} from "@/api/researchPaperApi";
import { apiClient } from "@/shared/api/client";


// ── Query keys ────────────────────────────────────────────────────────────────

export const paperKeys = {
  all:    ["papers"] as const,
  lists:  () => [...paperKeys.all, "list"] as const,
  list:   (params: GetAllPapersRequest) => [...paperKeys.lists(), params] as const,
  search: (params: SearchPapersRequest) => [...paperKeys.all, "search", params] as const,
  detail: (id: string) => [...paperKeys.all, "detail", id] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** GET /research-papers/all — paginated, no filters */
export function usePapers(params: GetAllPapersRequest = {}) {
  return useQuery({
    queryKey: paperKeys.list(params),
    queryFn:  () => getAllPapers(params),
  });
}

/** GET /research-papers — paginated with filters (topic name, query, year, etc.) */
export function useSearchPapers(params: SearchPapersRequest) {
  return useQuery({
    queryKey: paperKeys.search(params),
    queryFn:  () => searchPapers(params),
  });
}

/** GET /research-papers/:id */
export function usePaper(id: string) {
  return useQuery({
    queryKey: paperKeys.detail(id),
    queryFn:  () => getPaperById(id),
    enabled:  !!id,
  });
}

/** POST /research-papers/import — batch import by search query */
export function useImportPapers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ImportPapersRequest) => importPapers(request),
    onSuccess: () => {
      // Invalidate all paper lists so they refetch with new data
      queryClient.invalidateQueries({ queryKey: paperKeys.lists() });
    },
  });
}



// ── Types ─────────────────────────────────────────────────────────────────────

export interface ImportByLinkRequest {
  link: string;            // DOI URL or raw DOI, e.g. "https://doi.org/10.xxx"
  apiSource: string;       // "semanticscholar" | "openalex" | "crossref"
  researchTopicIds: string[]; // UUIDs — empty array to import without linking
}

export interface ImportSinglePaperResult {
  paperId: string;
  title: string;
  citationCount: number;
  journalName: string | null;
  authorNames: string[];
  linkedTopicNames: string[];
}

// ── API call ──────────────────────────────────────────────────────────────────

async function importPaperByLink(
  request: ImportByLinkRequest
): Promise<ImportSinglePaperResult> {
  const { data, error } = await apiClient.POST("/api/research-papers/import-single", {
    body: request as any,
  });

  if (error) {
    const msg =
      (error as any)?.message ??
      (error as any)?.title ??
      "Import failed";
    throw new Error(msg);
  }

  return data as ImportSinglePaperResult;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Import a single research paper by DOI / URL link.
 * On success, invalidates the papers list so the new paper appears automatically.
 *
 * Usage:
 *   const importPaper = useImportSinglePaper();
 *   importPaper.mutateAsync({ link, apiSource, researchTopicIds });
 */
export function useImportSinglePaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importPaperByLink,
    onSuccess: () => {
      // Refresh the papers list so the newly imported paper shows up
      queryClient.invalidateQueries({ queryKey: ["research", "papers"] });
    },
  });
}