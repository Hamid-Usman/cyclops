"use client";

import { X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Shared building blocks for the panel pages, in the panel's existing style.

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

export const smallButtonClass =
  "inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50";

export function formatMoney(amount: number | null | undefined, currency = "USD") {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Formats YYYY-MM-DD or an ISO date-time as e.g. "12 Nov 2026". */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: /^\d{4}-\d{2}-\d{2}$/.test(value) ? "UTC" : undefined,
  });
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const STATUS_ACCENTS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  paid: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-violet-500/10 text-violet-600",
  sent: "bg-sky-500/10 text-sky-600",
  viewed: "bg-sky-500/10 text-sky-600",
  lead: "bg-amber-500/10 text-amber-600",
  draft: "bg-amber-500/10 text-amber-600",
  inactive: "bg-muted text-muted-foreground",
  overdue: "bg-red-500/10 text-red-600",
  declined: "bg-red-500/10 text-red-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_ACCENTS[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {capitalize(status)}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function StatCards({
  stats,
}: {
  stats: { label: string; value: ReactNode; detail: string; icon: LucideIcon }[];
}) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, detail, icon: Icon }) => (
        <article key={label} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            </div>
          </div>
          <p className="border-t border-border/70 bg-muted/50 px-5 py-2.5 text-xs text-muted-foreground">{detail}</p>
        </article>
      ))}
    </section>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Loading, error and empty states for a list. */
export function ListState({
  isLoading,
  error,
  isEmpty,
  emptyText,
}: {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyText: string;
}) {
  if (isLoading) return <p className="px-5 py-6 text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return (
      <p role="alert" className="px-5 py-6 text-sm text-destructive">
        {error}
      </p>
    );
  if (isEmpty) return <p className="px-5 py-6 text-sm text-muted-foreground">{emptyText}</p>;
  return null;
}

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full overflow-y-auto border-2 border-r-4 border-b-4 border-r-primary/40 border-b-primary/40 border-border bg-card p-5 shadow-xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
            )}
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function FormActions({
  onCancel,
  pending,
  submitLabel,
  error,
}: {
  onCancel: () => void;
  pending: boolean;
  submitLabel: string;
  error: string | null;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </>
  );
}

/** Turns an empty form string into null, for optional nullable fields. */
export function orNull(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
}
