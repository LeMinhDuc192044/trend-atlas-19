import { normalizeRole, type Role } from "./roles";

const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_NAMEID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: Role;
}

export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(decodeURIComponent(escape(json))) as T;
  } catch {
    return null;
  }
}

export function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwt<Record<string, unknown>>(token);
  if (!payload) return null;

  return {
    id: (payload.sub as string | undefined) ?? (payload[CLAIM_NAMEID] as string | undefined),
    email: (payload.email as string | undefined) ?? (payload[CLAIM_EMAIL] as string | undefined),
    name: (payload.name as string | undefined) ?? (payload[CLAIM_NAME] as string | undefined),
    role: normalizeRole(payload.role ?? payload[CLAIM_ROLE]),
  };
}
