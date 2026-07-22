import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/app/guards/role-guard";
import type { Role } from "@/shared/auth/roles";

interface MainLayoutProps {
  children: ReactNode;
  roles?: readonly Role[];
  requireAuth?: boolean;
}

export function MainLayout({ children, roles, requireAuth = false }: MainLayoutProps) {
  const content = requireAuth || roles?.length ? (
    <RoleGuard allow={roles}>{children}</RoleGuard>
  ) : (
    children
  );

  return <AppShell>{content}</AppShell>;
}
