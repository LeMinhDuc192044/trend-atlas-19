import { create } from "zustand";
import { loginWithPassword, registerAccount } from "@/features/auth/api/auth-api";
import { clearAuthTokens, getAccessToken, setAccessToken, setRefreshToken } from "@/shared/auth/token-storage";
import { userFromToken, type AuthUser } from "@/shared/auth/jwt";
import { Role } from "@/shared/auth/roles";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,
  initialize: () => {
    if (get().initialized) return;
    const token = getAccessToken();
    set({
      token,
      user: token ? userFromToken(token) : null,
      initialized: true,
    });
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const result = await loginWithPassword({ email, password });
      const accessToken = result.accessToken;
      if (!accessToken) {
        throw new Error("Login response did not include an access token");
      }

      setAccessToken(accessToken);
      setRefreshToken(result.refreshToken ?? null);
      set({ token: accessToken, user: userFromToken(accessToken), loading: false, initialized: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  register: async (name, email, password) => {
    set({ loading: true });
    try {
      await registerAccount({
        fullName: name,
        email,
        password,
        role: Role.User,
      });
      set({ loading: false });
      await get().login(email, password);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  logout: () => {
    clearAuthTokens();
    set({ user: null, token: null, initialized: true });
  },
}));
