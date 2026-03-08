"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export function LoginScreen() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!cancelled && response.ok) {
          router.replace("/admin");
          return;
        }
      } catch {}

      if (!cancelled) {
        setCheckingSession(false);
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pseudo: pseudo.trim(), password }),
      });

      if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
          const body = (await response.json()) as { error?: string };
          if (body.error) {
            message = body.error;
          }
        } catch {}

        throw new Error(message);
      }

      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4 md:px-10 bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 md:px-10 bg-background flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-sm p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">
            Secure Access
          </p>
          <h1 className="text-2xl font-semibold">Admin login</h1>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <input
            type="text"
            className="border rounded-md px-3 py-2 bg-transparent"
            placeholder="Pseudo"
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            className="border rounded-md px-3 py-2 bg-transparent"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Connecting..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
