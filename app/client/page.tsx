"use client";

import Link from "next/link";
import { useState } from "react";
import { BriefcaseBusiness, CircleAlert, Clock3, FileText, ReceiptText } from "lucide-react";
import { apiErrorMessage } from "@/services/api";
import { useClientOverviewQuery } from "@/services/clients";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, formatMoney, ListState, StatCards, StatusBadge } from "../panel/ui";
import InvoiceModal from "./invoice-modal";
import ProposalModal from "./proposal-modal";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const overview = useClientOverviewQuery();
  const [openProposal, setOpenProposal] = useState<string | null>(null);
  const [openInvoice, setOpenInvoice] = useState<string | null>(null);
  const data = overview.data;
  const loading = overview.isLoading ? "…" : null;

  const toReview = (data?.proposals ?? []).filter((p) => p.status === "sent" || p.status === "viewed");
  const unpaid = (data?.invoices ?? []).filter((invoice) => invoice.status === "sent");
  const amountDue =
    data && data.summary.amountDue.length > 0
      ? data.summary.amountDue.map((t) => formatMoney(t.amount, t.currency)).join(" · ")
      : formatMoney(0);

  return (
    <main className="flex flex-col gap-8 pb-8">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Client</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Hello, {user?.displayName ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything shared with you: proposals to review, invoices to pay and how your projects are going.
        </p>
      </header>

      {overview.error && (
        <p role="alert" className="text-sm text-destructive">
          {apiErrorMessage(overview.error, "Couldn't load your overview.")}
        </p>
      )}

      <StatCards
        stats={[
          { label: "Proposals to review", value: loading ?? toReview.length, detail: "Waiting for your answer", icon: FileText },
          {
            label: "Unpaid invoices",
            value: loading ?? unpaid.length,
            detail: `${data?.summary.overdueInvoices ?? 0} overdue`,
            icon: Clock3,
          },
          { label: "Amount due", value: loading ?? amountDue, detail: "Across unpaid invoices", icon: ReceiptText },
          {
            label: "Active projects",
            value: loading ?? data?.summary.activeProjects ?? "—",
            detail: "Work underway for you",
            icon: BriefcaseBusiness,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodoList
          title="Proposals to review"
          description="Read them and accept or decline."
          href="/client/proposals"
          onOpen={setOpenProposal}
          actionLabel="Review"
          isLoading={overview.isLoading}
          emptyText="Nothing to review right now."
          items={toReview.map((proposal) => ({
            id: proposal.id,
            title: proposal.title,
            detail: proposal.validUntil
              ? `Valid until ${formatDate(proposal.validUntil)}`
              : `Sent ${formatDate(proposal.sentAt)}`,
            right: formatMoney(proposal.total, proposal.currency),
            urgent: false,
          }))}
        />
        <TodoList
          title="Invoices to pay"
          description="Sent to you and not marked paid yet."
          href="/client/invoices"
          onOpen={setOpenInvoice}
          actionLabel="View & pay"
          isLoading={overview.isLoading}
          emptyText="You're all paid up."
          items={unpaid.map((invoice) => ({
            id: invoice.id,
            title: `${invoice.number} · ${invoice.title}`,
            detail: invoice.paymentReportedAt
              ? `Payment reported ${formatDate(invoice.paymentReportedAt)} · waiting for confirmation`
              : invoice.isOverdue
                ? `Overdue since ${formatDate(invoice.dueDate)}`
                : `Due ${formatDate(invoice.dueDate)}`,
            right: formatMoney(invoice.total, invoice.currency),
            urgent: invoice.isOverdue && !invoice.paymentReportedAt,
            action: invoice.paymentReportedAt ? "View" : undefined,
          }))}
        />
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Your projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Projects you&apos;re the client on.</p>
          </div>
          <Link href="/client/projects" className="rounded-xl bg-primary px-4 py-1 text-sm text-white">
            View all
          </Link>
        </div>
        <ListState isLoading={overview.isLoading} error={null} isEmpty={!data?.projects.length} emptyText="No projects yet." />
        <ul className="divide-y divide-border">
          {(data?.projects ?? []).slice(0, 5).map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">Due {formatDate(project.dueDate)}</p>
              </div>
              <StatusBadge status={project.status} />
            </li>
          ))}
        </ul>
      </section>

      {openProposal && <ProposalModal id={openProposal} onClose={() => setOpenProposal(null)} />}
      {openInvoice && <InvoiceModal id={openInvoice} onClose={() => setOpenInvoice(null)} />}
    </main>
  );
}

function TodoList({
  title,
  description,
  href,
  items,
  isLoading,
  emptyText,
  onOpen,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  onOpen: (id: string) => void;
  actionLabel: string;
  items: { id: string; title: string; detail: string; right: string; urgent: boolean; action?: string }[];
  isLoading: boolean;
  emptyText: string;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link href={href} className="shrink-0 rounded-xl bg-primary px-4 py-1 text-sm text-white">
          See all
        </Link>
      </div>
      <ListState isLoading={isLoading} error={null} isEmpty={items.length === 0} emptyText={emptyText} />
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex min-w-0 items-start gap-3">
              <CircleAlert
                aria-hidden="true"
                size={18}
                className={`mt-0.5 shrink-0 ${item.urgent ? "text-destructive" : "text-primary"}`}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <p className="text-sm font-semibold tabular-nums">{item.right}</p>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:border-primary/40 hover:bg-primary/5"
              >
                {item.action ?? actionLabel}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
