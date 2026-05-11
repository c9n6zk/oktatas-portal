import React, { createContext, useContext, useEffect, useState } from "react";
import { clearToken, fetchMe, login as apiLogin } from "@/api/client";
import { registerForPushNotificationsAsync } from "@/push/registerPush";

type User = { id: string; email: string; name: string; role: string };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await fetchMe();
        setUser(user);
        // Bejelentkezett user → fire-and-forget push token regisztráció.
        registerForPushNotificationsAsync().catch(() => {});
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const u = await apiLogin(email, password);
    setUser(u);
    registerForPushNotificationsAsync().catch(() => {});
  }

  async function signOut() {
    await clearToken();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
