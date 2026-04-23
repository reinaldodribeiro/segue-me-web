"use client";

import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { LoginPayload } from "@/interfaces/Auth";
import { User } from "@/interfaces/User";
import AuthService from "@/services/api/AuthService";
import UserService from "@/services/api/UserService";
import { syncAuthCookie } from "@/utils/authCookie";

export interface AuthContextData {
  isLogged: boolean;
  token: string | null;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  signIn: (
    data: LoginPayload,
    onSuccess?: () => void,
    onError?: (err: unknown) => void,
  ) => Promise<void>;
  signInWithToken: (token: string, user?: User) => void;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useLocalStorage<string | null>("authToken", null);
  const [user, setUser] = useLocalStorage<User | null>("userData", null);

  // Keep the cookie in sync with localStorage so middleware can read it
  useEffect(() => {
    syncAuthCookie(token);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // If user data is already hydrated from localStorage, skip the blocking
    // profile fetch on mount — the data is already available for rendering.
    // The next API call will naturally catch a 401 if the token has expired.
    if (user) return;

    async function load() {
      try {
        const res = await UserService.getProfile();
        setUser(res.data.data);
      } catch (err: unknown) {
        // Token expirado ou inválido → encerra a sessão
        if ((err as { status?: number })?.status === 401) {
          setToken(null);
          setUser(null);
          router.push("/auth/login");
        }
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(
    async (
      data: LoginPayload,
      onSuccess?: () => void,
      onError?: (err: unknown) => void,
    ) => {
      try {
        const res = await AuthService.login(data);
        if (res.status === 200 && res.data.token) {
          setToken(res.data.token);
          setUser(res.data.user);
          onSuccess?.();
        }
      } catch (err) {
        if (onError) {
          onError(err);
        } else {
          console.error(err);
        }
      }
    },
    [setToken, setUser],
  );

  const signInWithToken = useCallback(
    (newToken: string, newUser?: User) => {
      setToken(newToken);
      if (newUser) setUser(newUser);
    },
    [setToken, setUser],
  );

  const logOut = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore logout errors
    } finally {
      setToken(null);
      setUser(null);
      router.push("/auth/login");
    }
  }, [setToken, setUser, router]);

  const valueData: AuthContextData = useMemo(
    () => ({
      isLogged: !!token,
      token,
      user,
      setUser,
      signIn,
      signInWithToken,
      logOut,
    }),
    [token, user, setUser, signIn, signInWithToken, logOut],
  );

  return (
    <AuthContext.Provider value={valueData}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
