import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  clearTokens,
  getAccessToken,
  getStoredUser,
  setStoredUser,
  setTokens,
  StoredUser,
} from "@/lib/storage";

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string, user: StoredUser) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: StoredUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [token, storedUser] = await Promise.all([getAccessToken(), getStoredUser()]);
      if (token && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = useCallback(
    async (accessToken: string, refreshToken: string, userData: StoredUser) => {
      await setTokens(accessToken, refreshToken);
      await setStoredUser(userData);
      setUser(userData);
    },
    []
  );

  const signOut = useCallback(async () => {
    await clearTokens();
    setUser(null);
    router.replace("/(auth)/sign-in");
  }, []);

  const updateUser = useCallback(async (updated: StoredUser) => {
    await setStoredUser(updated);
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
      updateUser,
    }),
    [user, isLoading, signIn, signOut, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }
  return context;
}
