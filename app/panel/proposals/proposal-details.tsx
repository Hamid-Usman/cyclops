"use client";

import type { Proposal } from "@/services/types";
import { formatDate, formatMoney, StatusBadge } from "../ui";

// Read-only view of a proposal, shared by the owner and the client.
export default function ProposalDetails({ proposal }: { proposal: Proposal }) {
  const money = (amount: number | null | undefined) => formatMoney(amount, proposal.currency);
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={proposal.status} />
        {proposal.sentAt && <span className="text-muted-foreground">Sent {formatDate(proposal.sentAt)}</span>}
        {proposal.validUntil && (
          <span className="text-muted-foreground">Valid until {formatDate(proposal.validUntil)}</span>
        )}
      </div>

      <Section title="1. The problem">{proposal.problemStatement}</Section>
      <Section title="2. Deliverables">{proposal.deliverables}</Section>
      <Section title="3. Timeline">
        {proposal.estimatedDuration && proposal.durationUnit
          ? `${proposal.estimatedDuration} ${proposal.durationUnit}${
              proposal.estimatedStartDate ? `, starting ${formatDate(proposal.estimatedStartDate)}` : ""
            }`
          : null}
      </Section>

      <div>
        <h4 className="font-semibold">4. Cost</h4>
        {proposal.totals ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-muted/40 p-3 tabular-nums">
            <dt className="text-muted-foreground">Price</dt>
            <dd className="text-right">{money(proposal.totals.subtotal)}</dd>
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="text-right">−{money(proposal.totals.discount)}</dd>
            <dt className="text-muted-foreground">Tax ({proposal.taxRate}%)</dt>
            <dd className="text-right">{money(proposal.totals.taxAmount)}</dd>
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold">{money(proposal.totals.total)}</dd>
            <dt className="text-muted-foreground">Deposit ({proposal.depositPercent}%)</dt>
            <dd className="text-right">{money(proposal.totals.deposit)}</dd>
          </dl>
        ) : (
          <p className="mt-1 text-muted-foreground">Not set yet.</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold">Payment schedule</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          When accepted, Cyclops creates the project with these milestones, and each is invoiced from these amounts.
        </p>
        <ol className="mt-2 divide-y divide-border rounded-lg border border-border">
          {proposal.paymentSchedule.map((step, index) => (
            <li key={`${step.title}-${index}`} className="flex items-start justify-between gap-4 px-3 py-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {index + 1}. {step.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{step.percent}%</span>
                </p>
                {step.deliverables && (
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{step.deliverables}</p>
                )}
                {step.dueDate && <p className="mt-0.5 text-xs text-muted-foreground">Due {formatDate(step.dueDate)}</p>}
              </div>
              <span className="shrink-0 tabular-nums">{step.amount === null ? "—" : money(step.amount)}</span>
            </li>
          ))}
        </ol>
      </div>

      <Section title="5. Terms">{proposal.terms}</Section>

      {proposal.acceptedByName && (
        <p className="rounded-lg bg-emerald-500/10 p-3 text-emerald-700">
          Accepted by {proposal.acceptedByName} on {formatDate(proposal.termsAcceptedAt)}.
        </p>
      )}
      {proposal.status === "declined" && (
        <p className="rounded-lg bg-red-500/10 p-3 text-red-700">
          Declined{proposal.declineReason ? `: ${proposal.declineReason}` : "."}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: string | null }) {
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{children || "Not filled in yet."}</p>
    </div>
  );
}
