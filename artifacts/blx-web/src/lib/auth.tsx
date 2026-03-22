import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  referralCode: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  phone?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; user?: User }>;
  register: (email: string, password: string, role: string, referralCode?: string) => Promise<{ error?: string; user?: User }>;
  googleAuth: (credential: string) => Promise<{ error?: string; user?: User; needsRole?: boolean; email?: string }>;
  googleComplete: (credential: string, role: string, referralCode?: string) => Promise<{ error?: string; user?: User }>;
  requestMagicLink: (email: string, purpose?: string) => Promise<{ error?: string; message?: string }>;
  verifyMagicLink: (token: string) => Promise<{ error?: string; user?: User; needsRegistration?: boolean; email?: string; verified?: boolean; purpose?: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error?: string; user?: User }>;
  sendSmsCode: (phone: string) => Promise<{ error?: string; message?: string }>;
  verifySmsCode: (phone: string, code: string) => Promise<{ error?: string; verified?: boolean }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/auth/me`, { credentials: "include" });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    setUser(data.user);
    return { user: data.user };
  };

  const register = async (email: string, password: string, role: string, referralCode?: string) => {
    const res = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, role, referralCode }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    setUser(data.user);
    return { user: data.user };
  };

  const googleAuth = async (credential: string) => {
    const res = await fetch(`/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    if (data.user) setUser(data.user);
    return data;
  };

  const googleComplete = async (credential: string, role: string, referralCode?: string) => {
    const res = await fetch(`/api/auth/google/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential, role, referralCode }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    setUser(data.user);
    return { user: data.user };
  };

  const requestMagicLink = async (email: string, purpose = "login") => {
    const res = await fetch(`/api/auth/magic-link/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { message: data.message };
  };

  const verifyMagicLink = async (token: string) => {
    const res = await fetch(`/api/auth/magic-link/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    if (data.user) setUser(data.user);
    return data;
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetch(`/api/auth/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    setUser(data.user);
    return { user: data.user };
  };

  const sendSmsCode = async (phone: string) => {
    const res = await fetch(`/api/auth/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { message: data.message };
  };

  const verifySmsCode = async (phone: string, code: string) => {
    const res = await fetch(`/api/auth/sms/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    if (data.verified) await refresh();
    return data;
  };

  const logout = async () => {
    await fetch(`/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register,
      googleAuth, googleComplete,
      requestMagicLink, verifyMagicLink,
      resetPassword,
      sendSmsCode, verifySmsCode,
      logout, refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
