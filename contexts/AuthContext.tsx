"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

// Token refresh interval (refresh 5 minutes before expiry)
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes (tokens expire in 1 hour)

interface User {
  id: number;
  email: string;
  role: "admin" | "citizen" | "validator";
  name: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected" | "needs_info";
  rejectionReason?: string;
  rejectionDate?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  csrfToken: string | null;
  login: (email: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Secure fetch wrapper that includes credentials and CSRF token
 */
async function secureFetch(
  url: string,
  options: RequestInit = {},
  csrfToken?: string | null
): Promise<Response> {
  const headers = new Headers(options.headers);

  // Always include credentials for cookie-based auth
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  // Add CSRF token for state-changing requests
  const method = options.method?.toUpperCase() ?? "GET";
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  return fetch(url, fetchOptions);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingAuth = useRef(false);

  /**
   * Fetch a fresh CSRF token from the server (only when needed)
   */
  const fetchCsrfToken = useCallback(async (): Promise<string | null> => {
    if (csrfToken) return csrfToken;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
    return null;
  }, [csrfToken]);

  /**
   * Refresh the access token using the refresh token cookie
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await secureFetch(
        `${API_BASE_URL}/auth/refresh`,
        { method: "POST" },
        csrfToken
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        return true;
      }

      // Refresh failed - clear auth state
      setUser(null);
      setToken(null);
      return false;
    } catch (error) {
      console.error("Session refresh failed:", error);
      setUser(null);
      setToken(null);
      return false;
    }
  }, [csrfToken]);

  /**
   * Check current authentication status - ALWAYS called on mount
   */
  const checkAuth = useCallback(async () => {
    // Prevent concurrent auth checks
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;

    try {
      // Try to verify session via /auth/me endpoint
      const response = await secureFetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        // Access token expired or missing, try to refresh
        const refreshed = await refreshSession();
        if (!refreshed) {
          // Refresh also failed, user is not authenticated
          setUser(null);
          setToken(null);
        }
      } else {
        // Other error, clear state
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      // Network error - silently fail but clear state
      console.error("Auth check failed:", error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
      isCheckingAuth.current = false;
    }
  }, [refreshSession]);

  // ALWAYS check auth on initial mount
  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  // Set up automatic token refresh (only when authenticated)
  useEffect(() => {
    if (user) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up new refresh interval
      refreshIntervalRef.current = setInterval(() => {
        refreshSession();
      }, TOKEN_REFRESH_INTERVAL);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [user, refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      // Get fresh CSRF token before login
      const freshCsrf = await fetchCsrfToken();

      const response = await secureFetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
        freshCsrf
      );

      if (!response.ok) {
        let message = "Unable to authenticate";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            message = errorData.message;
          }
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(message);
      }

      const data = await response.json();

      setUser(data.user);
      setToken(data.token);

      return data.user;
    },
    [fetchCsrfToken]
  );

  const logout = useCallback(async () => {
    try {
      const csrf = csrfToken || (await fetchCsrfToken());
      await secureFetch(
        `${API_BASE_URL}/auth/logout`,
        { method: "POST" },
        csrf
      );
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    // Clear state regardless of server response
    setUser(null);
    setToken(null);
    setCsrfToken(null);

    // Clear refresh interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    router.push("/");
  }, [csrfToken, fetchCsrfToken, router]);

  const logoutAll = useCallback(async () => {
    try {
      const csrf = csrfToken || (await fetchCsrfToken());
      await secureFetch(
        `${API_BASE_URL}/auth/logout-all`,
        { method: "POST" },
        csrf
      );
    } catch (error) {
      console.error("Logout all request failed:", error);
    }

    // Clear state
    setUser(null);
    setToken(null);
    setCsrfToken(null);

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    router.push("/");
  }, [csrfToken, fetchCsrfToken, router]);

  const value = {
    user,
    token,
    csrfToken,
    login,
    logout,
    logoutAll,
    refreshSession,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Custom hook for making authenticated API calls with CSRF protection
 */
export function useSecureFetch() {
  const { csrfToken, refreshSession } = useAuth();

  const secureFetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let response = await secureFetch(url, options, csrfToken);

      // If unauthorized, try to refresh and retry once
      if (response.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          response = await secureFetch(url, options, csrfToken);
        }
      }

      return response;
    },
    [csrfToken, refreshSession]
  );

  return secureFetchWithAuth;
}
