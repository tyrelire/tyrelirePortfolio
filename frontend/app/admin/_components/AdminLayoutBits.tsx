import type { ReactNode } from "react";
import { API_BASE_URL, panelClass } from "../_lib/constants";

export function AdminMain({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-10 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">{children}</div>
    </main>
  );
}

export function AdminHero(props: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className={`${panelClass} p-5 md:p-6`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">Admin</p>
          <h1
            className="text-2xl md:text-4xl font-semibold"
            style={{ color: "var(--accent-red)" }}
          >
            {props.title}
          </h1>
          <p className="mt-2 text-sm opacity-75">{props.description}</p>
          <p className="mt-3 text-xs opacity-60">API: {API_BASE_URL}</p>
        </div>
        {props.actionHref && props.actionLabel && (
          <a
            href={props.actionHref}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            {props.actionLabel}
          </a>
        )}
      </div>
    </section>
  );
}

export function AnchorPills({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-sm">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-full border px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function Notice({
  error,
  message,
}: {
  error: string | null;
  message: string | null;
}) {
  return (
    <>
      {error && (
        <p
          className="rounded-xl border border-red-500/40 px-4 py-3 text-sm"
          style={{ color: "var(--accent-red)" }}
        >
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border px-4 py-3 text-sm text-emerald-600">
          {message}
        </p>
      )}
    </>
  );
}

export function SectionCard(props: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={props.id} className={`${panelClass} p-5 md:p-6 scroll-mt-24`}>
      <h2 className="text-xl font-semibold mb-4">{props.title}</h2>
      {props.children}
    </section>
  );
}
