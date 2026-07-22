import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { API_BASE_URL } from "@/shared/config/env";
import { getAccessToken } from "@/shared/auth/token-storage";

export type ApiResponse<T> = {
  success?: boolean;
  message?: string | null;
  data?: T | null;
  error?: {
    statusCode?: number;
    message?: string | null;
    validationErrors?: Record<string, string[]>;
    exceptionType?: string | null;
  } | null;
  timestamp?: string;
  traceId?: string | null;
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  validationErrors?: Record<string, string[]>;

  constructor(status: number, message: string, body: unknown, validationErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.body = body;
    this.validationErrors = validationErrors;
  }
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    request.headers.set("Accept", "application/json");
    const token = getAccessToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
};

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});

apiClient.use(authMiddleware);

export function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "success" in response) {
    const wrapped = response as ApiResponse<T>;
    if (wrapped.success === false) {
      throw new ApiError(
        wrapped.error?.statusCode ?? 400,
        wrapped.error?.message ?? wrapped.message ?? "Request failed",
        wrapped,
        wrapped.error?.validationErrors,
      );
    }

    return wrapped.data as T;
  }

  return response as T;
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const body = data as Record<string, any> | null;
    const validationErrors =
      body?.errors ?? body?.error?.validationErrors ?? body?.validationErrors ?? undefined;
    const message =
      body?.message ?? body?.error?.message ?? body?.title ?? res.statusText ?? `Request failed (${res.status})`;

    throw new ApiError(res.status, message, data, validationErrors);
  }

  return data as T;
}
