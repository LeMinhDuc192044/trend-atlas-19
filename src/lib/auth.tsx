import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Role, roleLabel } from "@/shared/auth/roles";
import type { AuthUser } from "@/shared/auth/jwt";

export { Role, roleLabel };
export type { AuthUser };

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore();
}
