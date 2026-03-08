"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const HIDDEN_LOGIN_ROUTE = "/tyrelire-login";

type SessionState = {
  checking: boolean;
  authenticated: boolean;
  pseudo: string | null;
};

export function useAdminSession(redirectToLogin = false) {
  const router = useRouter();
  const [state, setState] = useState<SessionState>({
    checking: true,
    authenticated: false,
    pseudo: null,
  });

  const checkSession = useCallback(async () => {
    const fetchSession = async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        authenticated: boolean;
        pseudo: string;
      };

      return payload;
    };

    try {
      let payload = await fetchSession();

      // Avoid a login redirect bounce when the auth cookie is still propagating.
      if (!payload) {
        await new Promise((resolve) => {
          setTimeout(resolve, 180);
        });
        payload = await fetchSession();
      }

      if (!payload) {
        throw new Error("Unauthorized");
      }

      setState({
        checking: false,
        authenticated: payload.authenticated,
        pseudo: payload.pseudo,
      });
    } catch {
      setState({
        checking: false,
        authenticated: false,
        pseudo: null,
      });

      if (redirectToLogin) {
        router.replace(HIDDEN_LOGIN_ROUTE);
      }
    }
  }, [redirectToLogin, router]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const logout = useCallback(async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setState({
      checking: false,
      authenticated: false,
      pseudo: null,
    });

    router.replace(HIDDEN_LOGIN_ROUTE);
  }, [router]);

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ): Promise<string | null> => {
      const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
          const body = (await response.json()) as { error?: string };
          if (body.error) {
            message = body.error;
          }
        } catch {
          // Keep fallback error message.
        }
        return message;
      }

      return null;
    },
    [],
  );

  return {
    ...state,
    checkSession,
    logout,
    changePassword,
  };
}
