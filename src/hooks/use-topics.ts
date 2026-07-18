import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/api/topicApi";

// ── Query keys ────────────────────────────────────────────────────────────────

export const topicKeys = {
  all:    ["topics"] as const,
  lists:  () => [...topicKeys.all, "list"] as const,
  detail: (id: string) => [...topicKeys.all, "detail", id] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** GET /research-topics */
export function useTopics() {
  return useQuery({
    queryKey: topicKeys.lists(),
    queryFn:  getTopics,
  });
}

/** GET /research-topics/:id */
export function useTopic(id: string) {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn:  () => getTopic(id),
    enabled:  !!id,
  });
}

/** POST /research-topics */
export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTopic,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
  });
}

/** PUT /research-topics/:id */
export function useUpdateTopic(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateTopic(id, data),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      queryClient.invalidateQueries({ queryKey: topicKeys.detail(id) });
    },
  });
}

/** DELETE /research-topics/:id */
export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTopic,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
  });
}