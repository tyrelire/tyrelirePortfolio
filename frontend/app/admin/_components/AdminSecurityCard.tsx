"use client";

import { type FormEvent, useState } from "react";

export function AdminSecurityCard(props: {
  pseudo: string | null;
  onLogout: () => Promise<void>;
  onChangePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<string | null>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match");
      return;
    }

    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters");
      return;
    }

    setSubmitting(true);
    try {
      const nextError = await props.onChangePassword(
        currentPassword,
        newPassword,
      );
      if (nextError) {
        setError(nextError);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">
            Security
          </p>
          <h2 className="text-lg font-semibold">
            Admin account: {props.pseudo ?? "tyrelire"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            void props.onLogout();
          }}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Logout
        </button>
      </div>

      <form
        className="mt-4 grid gap-3"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <input
          type="password"
          className="border rounded-md px-3 py-2 bg-transparent"
          placeholder="Current password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded-md px-3 py-2 bg-transparent"
          placeholder="New password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded-md px-3 py-2 bg-transparent"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <button
          type="submit"
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Change password"}
        </button>
      </form>
    </section>
  );
}
