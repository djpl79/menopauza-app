import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, type User } from '@workspace/api-client-react';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const TOKEN_KEY = 'menopauza-mobile-token';

type AuthContextValue = {
  token: string | null;
  hydrated: boolean;
  user: User | null;
  saveSession: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(TOKEN_KEY)
      .then(async (storedToken) => {
        if (!mounted) return;
        tokenRef.current = storedToken;
        setToken(storedToken);
        if (storedToken) {
          try {
            const storedUser = await getProfile();
            if (mounted) setUser(storedUser);
          } catch {
            tokenRef.current = null;
            setToken(null);
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        }
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      hydrated,
      user,
      saveSession: async (nextToken, nextUser) => {
        tokenRef.current = nextToken;
        setToken(nextToken);
        setUser(nextUser);
        await AsyncStorage.setItem(TOKEN_KEY, nextToken);
      },
      signOut: async () => {
        tokenRef.current = null;
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem(TOKEN_KEY);
      },
    }),
    [hydrated, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export { TOKEN_KEY };