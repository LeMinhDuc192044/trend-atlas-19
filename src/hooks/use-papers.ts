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

/** POST /research-papers/import-single — import one paper by DOI/link */
export function useImportSinglePaper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ImportSinglePaperRequest) => importSinglePaper(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paperKeys.lists() });
    },
  });
}