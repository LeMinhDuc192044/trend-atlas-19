import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Role, roleLabel, type Role as RoleValue } from "@/shared/auth/roles";

interface RoleGuardProps {
  children: ReactNode;
  allow?: readonly RoleValue[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allow, fallback }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
    }
  }, [initialized, navigate, user]);

  if (!initialized) {
    return null;
  }

  if (!user) {
    return fallback ?? null;
  }

  if (allow?.length && !allow.includes(user.role ?? Role.User)) {
    return (
      fallback ?? (
        <div className="p-8">
          <div className="max-w-md">
            <h1 className="text-xl font-semibold">Access denied</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your current role is {roleLabel(user.role)}.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
