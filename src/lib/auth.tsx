import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, decodeJwt, getToken, setToken } from "./api-client";

// Backend role enum: Admin=0, User=1, Researcher=2
export const Role = {
  Admin: 0,
  User: 1,
  Researcher: 2,
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const roleLabel = (r: Role | number | undefined): string =>
  r === 0 ? "Admin" : r === 1 ? "User" : r === 2 ? "Researcher" : "Unknown";

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Common JWT claim URIs used by ASP.NET Core Identity.
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_NAMEID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwt<Record<string, unknown>>(token);
  if (!payload) return null;
  const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  if (expiresAt !== undefined && expiresAt <= Date.now()) return null;
  const rawRole = payload["role"] ?? payload[CLAIM_ROLE];
  const roleNum =
    typeof rawRole === "number"
      ? rawRole
      : typeof rawRole === "string" && rawRole !== ""
        ? isNaN(Number(rawRole))
          ? rawRole === "Admin"
            ? 0
            : rawRole === "User"
              ? 1
              : rawRole === "Researcher"
                ? 2
                : undefined
          : Number(rawRole)
        : undefined;
  return {
    id: (payload["sub"] as string) ?? (payload[CLAIM_NAMEID] as string),
    email: (payload["email"] as string) ?? (payload[CLAIM_EMAIL] as string),
    name: (payload["name"] as string) ?? (payload[CLAIM_NAME] as string),
    role: roleNum as Role | undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (t) {
      const restoredUser = userFromToken(t);
      if (restoredUser) {
        setTokenState(t);
        setUser(restoredUser);
      } else {
        setToken(null);
      }
    }
    setAuthLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        data?: { accessToken?: string };
        token?: string;
        accessToken?: string;
        jwt?: string;
      }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      const nextToken = res.data?.accessToken ?? res.token ?? res.accessToken ?? res.jwt;
      if (!nextToken) throw new Error("Login response did not include a token");
      setToken(nextToken);
      setTokenState(nextToken);
      setUser(userFromToken(nextToken));
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ fullName: name, email, password, role: 1 }),
        });
      } finally {
        setLoading(false);
      }
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      if (token) await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
      setTokenState(null);
      setUser(null);
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      authLoading,
      login,
      register,
      logout,
    }),
    [user, token, loading, authLoading, login, register, logout],
  );
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
