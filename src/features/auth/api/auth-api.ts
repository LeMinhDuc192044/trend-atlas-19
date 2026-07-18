import { apiClient, unwrapApiResponse } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

export type LoginRequest = components["schemas"]["LoginRequest"];
export type LoginResponse = components["schemas"]["LoginResponse"];
export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type RegisterResponse = components["schemas"]["RegisterResponse"];

export async function loginWithPassword(request: LoginRequest): Promise<LoginResponse> {
  const { data, error, response } = await apiClient.POST("/api/auth/login", {
    body: request,
  });

  if (error) {
    throw error;
  }

  return unwrapApiResponse<LoginResponse>(data ?? { success: false, message: (response as Response).statusText });
}

export async function registerAccount(request: RegisterRequest): Promise<RegisterResponse> {
  const { data, error, response } = await apiClient.POST("/api/auth/register", {
    body: request,
  });

  if (error) {
    throw error;
  }

  return unwrapApiResponse<RegisterResponse>(data ?? { success: false, message: (response as Response).statusText });
}

export async function logoutSession(): Promise<void> {
  const { error } = await apiClient.POST("/api/auth/logout");
  if (error) {
    throw error;
  }
}
