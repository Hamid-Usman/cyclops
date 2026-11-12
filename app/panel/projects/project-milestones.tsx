"use client";

import Link from "next/link";
import { CheckCircle2, ReceiptText } from "lucide-react";
import { useState } from "react";
import { apiErrorMessage } from "@/services/api";
import { useCreateInvoiceFromMilestoneMutation } from "@/services/invoices";
import { useProjectMilestonesQuery, useUpdateMilestoneMutation } from "@/services/projects";
import type { Project, ProjectMilestone } from "@/services/types";
import { formatDate, formatMoney, Modal, smallButtonClass, StatusBadge } from "../ui";

const BILLABLE = new Set(["active", "completed"]);

// A milestone can be billed when it has no invoice, or its invoice was voided.
const canBill = (milestone: ProjectMilestone) => !milestone.invoice || milestone.invoice.status === "void";

/**
 * The project's payment schedule, generated from the accepted proposal: what
 * is delivered, what it is worth, and its invoice. Drafting an invoice uses
 * the agreed price, discount, currency and tax.
 */
export default function ProjectMilestones({ project, onClose }: { project: Project; onClose: () => void }) {
  const milestones = useProjectMilestonesQuery(project.id);
  const createInvoice = useCreateInvoiceFromMilestoneMutation();
  const updateMilestone = useUpdateMilestoneMutation();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const list = milestones.data ?? [];
  const billable = BILLABLE.has(project.status);
  const invoicedTotal = list
    .filter((milestone) => milestone.invoice && milestone.invoice.status !== "void")
    .reduce((sum, milestone) => sum + milestone.amount, 0);
  const contractTotal = list.reduce((sum, milestone) => sum + milestone.amount, 0);
  const currency = list[0]?.currency ?? "USD";

  async function bill(milestone: ProjectMilestone) {
    setMessage(null);
    try {
      const invoice = await createInvoice.mutateAsync({ milestoneId: milestone.id, projectId: project.id });
      setMessage({
        tone: "ok",
        text: `Draft invoice created for ${milestone.title} (${formatMoney(invoice.total, invoice.currency)}). Review and send it on the Invoices page.`,
      });
    } catch (error) {
      setMessage({ tone: "error", text: apiErrorMessage(error, "Couldn't create the invoice.") });
    }
  }

  async function toggleDelivered(milestone: ProjectMilestone) {
    setMessage(null);
    try {
      await updateMilestone.mutateAsync({
        projectId: project.id,
        milestoneId: milestone.id,
        completed: !milestone.completedAt,
      });
    } catch (error) {
      setMessage({ tone: "error", text: apiErrorMessage(error, "Couldn't update the milestone.") });
    }
  }

  return (
    <Modal title={project.name} eyebrow="Project milestones" onClose={onClose} wide>
      <div className="space-y-5 text-sm">
        {project.deliverables && (
          <div>
            <h4 className="font-semibold">Deliverables</h4>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{project.deliverables}</p>
          </div>
        )}

        {message && (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={`rounded-lg p-3 ${message.tone === "error" ? "bg-red-500/10 text-red-700" : "bg-emerald-500/10 text-emerald-700"}`}
          >
            {message.text}{" "}
            {message.tone === "ok" && (
              <Link href="/panel/invoices" className="font-medium underline">
                Go to invoices
              </Link>
            )}
          </p>
        )}

        {milestones.isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : milestones.error ? (
          <p role="alert" className="text-destructive">
            {apiErrorMessage(milestones.error, "Couldn't load the milestones.")}
          </p>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground">
            No payment schedule yet. It is created when the client accepts a proposal for this project.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground">Agreed total</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(invoicedTotal, currency)} invoiced of {formatMoney(contractTotal, currency)}
              </span>
            </div>
            <ol className="divide-y divide-border rounded-lg border border-border">
              {list.map((milestone, index) => (
                <li key={milestone.id} className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {index + 1}. {milestone.title}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{milestone.percent}%</span>
                      {milestone.completedAt && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-emerald-700">
                          <CheckCircle2 aria-hidden="true" size={12} />
                          Delivered {formatDate(milestone.completedAt)}
                        </span>
                      )}
                    </p>
                    {milestone.deliverables && (
                      <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{milestone.deliverables}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatMoney(milestone.amount, milestone.currency)}
                      {milestone.dueDate ? ` · due ${formatDate(milestone.dueDate)}` : ""}
                      {milestone.invoice && (
                        <>
                          {" · "}
                          {milestone.invoice.number ?? "Draft invoice"}{" "}
                          <StatusBadge status={milestone.invoice.status} />
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {milestone.kind !== "deposit" && (
                      <button
                        type="button"
                        className={smallButtonClass}
                        disabled={updateMilestone.isPending}
                        onClick={() => toggleDelivered(milestone)}
                      >
                        {milestone.completedAt ? "Undo delivered" : "Mark delivered"}
                      </button>
                    )}
                    {canBill(milestone) && (
                      <button
                        type="button"
                        className={smallButtonClass}
                        disabled={!billable || createInvoice.isPending}
                        title={billable ? undefined : "Only active or completed projects can be invoiced"}
                        onClick={() => bill(milestone)}
                      >
                        <ReceiptText aria-hidden="true" size={14} />
                        {milestone.kind === "deposit" ? "Invoice deposit" : "Create invoice"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </Modal>
  );
}
