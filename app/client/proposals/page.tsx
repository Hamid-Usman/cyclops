"use client";

import { useState } from "react";
import { apiErrorMessage } from "@/services/api";
import { useReceivedProposalsQuery } from "@/services/proposals";
import type { ProposalSummary } from "@/services/types";
import {
  formatDate,
  formatMoney,
  ListState,
  PageHeader,
  Panel,
  smallButtonClass,
  StatusBadge,
} from "../../panel/ui";
import ProposalModal from "../proposal-modal";

const isOpen = (proposal: ProposalSummary) => proposal.status === "sent" || proposal.status === "viewed";

const TABS = [
  { key: "open", label: "To review", filter: isOpen },
  { key: "answered", label: "Answered", filter: (p: ProposalSummary) => !isOpen(p) },
  { key: "all", label: "All", filter: () => true },
] as const;

export default function Page() {
  const received = useReceivedProposalsQuery();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("open");
  const [openId, setOpenId] = useState<string | null>(null);

  const all = received.data ?? [];
  const list = all.filter(TABS.find((t) => t.key === tab)!.filter);

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader eyebrow="Client" title="Proposals" />

      <Panel title="Proposals sent to you" description="Open one to read it, then accept or decline.">
        <div role="tablist" aria-label="Filter proposals" className="flex gap-2 border-b border-border px-5 py-3">
          {TABS.map((t) => {
            const count = all.filter(t.filter).length;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>
        <ListState
          isLoading={received.isLoading}
          error={received.error ? apiErrorMessage(received.error, "Couldn't load your proposals.") : null}
          isEmpty={list.length === 0}
          emptyText={tab === "open" ? "Nothing to review right now." : "No proposals here yet."}
        />
        {list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Proposal</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Sent</th>
                  <th className="px-5 py-3 font-medium">Valid until</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {list.map((proposal) => (
                  <tr key={proposal.id}>
                    <td className="px-5 py-4 font-medium">{proposal.title}</td>
                    <td className="px-5 py-4 tabular-nums">{formatMoney(proposal.total, proposal.currency)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(proposal.sentAt)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(proposal.validUntil)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" className={smallButtonClass} onClick={() => setOpenId(proposal.id)}>
                        {isOpen(proposal) ? "Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {openId && <ProposalModal id={openId} onClose={() => setOpenId(null)} />}
    </main>
  );
}
