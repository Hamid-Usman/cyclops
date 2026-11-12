"use client";

import { useState } from "react";
import { apiErrorMessage } from "@/services/api";
import { useClientOverviewQuery } from "@/services/clients";
import type { Project } from "@/services/types";
import {
  formatDate,
  formatMoney,
  ListState,
  Modal,
  PageHeader,
  Panel,
  smallButtonClass,
  StatusBadge,
} from "../../panel/ui";
import InvoiceModal from "../invoice-modal";
import ProposalModal from "../proposal-modal";

const PROJECT_STATUS_HELP: Record<Project["status"], string> = {
  inactive: "Waiting for you to accept a proposal before work starts.",
  active: "Work is underway.",
  completed: "Delivered.",
  cancelled: "This project was cancelled.",
};

export default function Page() {
  const overview = useClientOverviewQuery();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const projects = overview.data?.projects ?? [];
  const project = projects.find((item) => item.id === projectId) ?? null;
  const proposals = (overview.data?.proposals ?? []).filter((item) => item.projectId === projectId);
  const invoices = (overview.data?.invoices ?? []).filter((item) => item.projectId === projectId);
  const milestones = (overview.data?.milestones ?? []).filter((item) => item.projectId === projectId);

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader eyebrow="Client" title="Projects" />
      <Panel
        title="Projects you're the client on"
        description="A project becomes active once you accept a proposal for it."
      >
        <ListState
          isLoading={overview.isLoading}
          error={overview.error ? apiErrorMessage(overview.error, "Couldn't load your projects.") : null}
          isEmpty={projects.length === 0}
          emptyText="No projects yet."
        />
        {projects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Start</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 text-right font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {projects.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="max-w-md truncate text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(item.startDate)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(item.dueDate)}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" className={smallButtonClass} onClick={() => setProjectId(item.id)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {project && !proposalId && !invoiceId && (
        <Modal title={project.name} eyebrow="Project" onClose={() => setProjectId(null)} wide>
          <div className="space-y-6 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={project.status} />
              <span className="text-muted-foreground">{PROJECT_STATUS_HELP[project.status]}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
              <dt className="text-muted-foreground">Start</dt>
              <dt className="text-muted-foreground">Due</dt>
              <dt className="hidden text-muted-foreground sm:block">Work started</dt>
              <dd>{formatDate(project.startDate)}</dd>
              <dd>{formatDate(project.dueDate)}</dd>
              <dd className="hidden sm:block">{formatDate(project.activatedAt)}</dd>
            </dl>
            {project.description && <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>}
            {project.deliverables && (
              <section>
                <h4 className="font-semibold">Deliverables</h4>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{project.deliverables}</p>
              </section>
            )}

            {milestones.length > 0 && (
              <section>
                <h4 className="font-semibold">Milestones and payments</h4>
                <ol className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {milestones.map((milestone, index) => {
                    const invoice = invoices.find((item) => item.id === milestone.invoice?.id);
                    return (
                      <li key={milestone.id} className="flex items-start justify-between gap-3 px-3 py-2">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {index + 1}. {milestone.title}
                            <span className="ml-2 text-xs font-normal text-muted-foreground">{milestone.percent}%</span>
                          </p>
                          {milestone.deliverables && (
                            <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{milestone.deliverables}</p>
                          )}
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatMoney(milestone.amount, milestone.currency)}
                            {milestone.dueDate ? ` · due ${formatDate(milestone.dueDate)}` : ""}
                            {milestone.completedAt ? ` · delivered ${formatDate(milestone.completedAt)}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {milestone.invoice && milestone.invoice.status !== "void" ? (
                            <>
                              <StatusBadge status={invoice?.isOverdue ? "overdue" : milestone.invoice.status} />
                              {invoice && (
                                <button type="button" className={smallButtonClass} onClick={() => setInvoiceId(invoice.id)}>
                                  {invoice.status === "sent" && !invoice.paymentReportedAt ? "View & pay" : "View"}
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not invoiced yet</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            <section>
              <h4 className="font-semibold">Proposals</h4>
              {proposals.length === 0 ? (
                <p className="mt-1 text-muted-foreground">No proposals sent for this project yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {proposals.map((proposal) => (
                    <li key={proposal.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{proposal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(proposal.total, proposal.currency)} · sent {formatDate(proposal.sentAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={proposal.status} />
                        <button type="button" className={smallButtonClass} onClick={() => setProposalId(proposal.id)}>
                          {proposal.status === "sent" || proposal.status === "viewed" ? "Review" : "View"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="font-semibold">Invoices</h4>
              {invoices.length === 0 ? (
                <p className="mt-1 text-muted-foreground">No invoices for this project yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {invoices.map((invoice) => (
                    <li key={invoice.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {invoice.number} · {invoice.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(invoice.total, invoice.currency)} · due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={invoice.isOverdue ? "overdue" : invoice.status} />
                        <button type="button" className={smallButtonClass} onClick={() => setInvoiceId(invoice.id)}>
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </Modal>
      )}

      {/* Opened from the project view; closing returns to it. */}
      {proposalId && <ProposalModal id={proposalId} onClose={() => setProposalId(null)} />}
      {invoiceId && <InvoiceModal id={invoiceId} onClose={() => setInvoiceId(null)} />}
    </main>
  );
}
