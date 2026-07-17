export const Role = {
  Admin: 0,
  User: 1,
  Researcher: 2,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_AUTHENTICATED_ROLES = [Role.Admin, Role.User, Role.Researcher] as const;
export const ADMIN_ONLY = [Role.Admin] as const;
export const ADVANCED_RESEARCH_ROLES = [Role.Admin, Role.Researcher] as const;

export const roleLabel = (role: Role | number | string | undefined): string => {
  if (role === Role.Admin || role === "Admin") return "Admin";
  if (role === Role.User || role === "User") return "User";
  if (role === Role.Researcher || role === "Researcher") return "Researcher";
  return "Unknown";
};

export const normalizeRole = (role: unknown): Role | undefined => {
  if (role === Role.Admin || role === "Admin" || role === "0") return Role.Admin;
  if (role === Role.User || role === "User" || role === "1") return Role.User;
  if (role === Role.Researcher || role === "Researcher" || role === "2") return Role.Researcher;
  return undefined;
};

export const hasAnyRole = (role: Role | undefined, allowed: readonly Role[]): boolean =>
  role !== undefined && allowed.includes(role);
