import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { AUTH_UNAUTHORIZED_EVENT } from "@/shared/api/client";
import { Role, roleLabel } from "@/shared/auth/roles";
import type { AuthUser } from "@/shared/auth/jwt";

export { Role, roleLabel };
export type { AuthUser };

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout]);

  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore();
}
