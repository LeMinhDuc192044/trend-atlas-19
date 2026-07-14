import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const rawRole = payload["role"] ?? payload[CLAIM_ROLE];
  const roleNum =
    typeof rawRole === "number" ? rawRole :
    typeof rawRole === "string" && rawRole !== "" ? (isNaN(Number(rawRole)) ?
      (rawRole === "Admin" ? 0 : rawRole === "User" ? 1 : rawRole === "Researcher" ? 2 : undefined)
      : Number(rawRole)) : undefined;
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

  useEffect(() => {
    const t = getToken();
    if (t) {
      setTokenState(t);
      setUser(userFromToken(t));
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    async login(email, password) {
      setLoading(true);
      try {
        // Adjust endpoint/shape to match your API. Common shapes handled below.
        const res = await apiFetch<{ token?: string; accessToken?: string; jwt?: string }>(
          "/api/auth/login",
          { method: "POST", body: JSON.stringify({ email, password }) },
        );
        const t = res.token ?? res.accessToken ?? res.jwt;
        if (!t) throw new Error("Login response did not include a token");
        setToken(t);
        setTokenState(t);
        setUser(userFromToken(t));
      } finally {
        setLoading(false);
      }
    },
    async register(name, email, password) {
      setLoading(true);
      try {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        await this.login(email, password);
      } finally {
        setLoading(false);
      }
    },
    logout() {
      setToken(null);
      setTokenState(null);
      setUser(null);
    },
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
