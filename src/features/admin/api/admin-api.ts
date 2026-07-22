import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { useAuthStore } from "@/features/auth/model/auth-store";

export type AdminUserDto = components["schemas"]["AdminUserDto"];
export type AdminApiDataSourceDto = components["schemas"]["AdminApiDataSourceDto"];

export function useAdminUsers() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["admin", "users"],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/admin/users");
      if (error) throw error;
      return unwrapApiResponse<AdminUserDto[]>(data) ?? [];
    },
  });
}

export function useAdminDataSources() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["admin", "data-sources"],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/admin/data-sources");
      if (error) throw error;
      return unwrapApiResponse<AdminApiDataSourceDto[]>(data) ?? [];
    },
  });
}
