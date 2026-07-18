export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5220";

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";
