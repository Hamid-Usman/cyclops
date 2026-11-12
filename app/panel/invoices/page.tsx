"use client";

import { CheckCheck, Clock3, FileText, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/services/api";
import { useClientsQuery } from "@/services/clients";
import {
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useInvoiceActionMutation,
  useInvoicesQuery,
} from "@/services/invoices";
import { useProjectsQuery } from "@/services/projects";
import type { Invoice } from "@/services/types";
import {
  Field,
  formatDate,
  formatMoney,
  FormActions,
  inputClass,
  ListState,
  Modal,
  orNull,
  PageHeader,
  Panel,
  primaryButtonClass,
  smallButtonClass,
  StatCards,
  StatusBadge,
} from "../ui";

interface LineDraft {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

let nextLineKey = 1;
const newLine = (): LineDraft => ({ key: nextLineKey++, description: "", quantity: "1", unitPrice: "" });

// Totals per currency, e.g. "$1,040.06 · €200.00".
function sumByCurrency(invoices: Invoice[]) {
  const totals = new Map<string, number>();
  for (const invoice of invoices) {
    totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + invoice.total);
  }
  if (totals.size === 0) return formatMoney(0);
  return [...totals].map(([currency, total]) => formatMoney(total, currency)).join(" · ");
}

export default function Page() {
  const invoices = useInvoicesQuery();
  const projects = useProjectsQuery();
  const clients = useClientsQuery();
  const createInvoice = useCreateInvoiceMutation();
  const deleteInvoice = useDeleteInvoiceMutation();
  const invoiceAction = useInvoiceActionMutation();
  const [creating, setCreating] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>([newLine()]);
  const [rowError, setRowError] = useState<string | null>(null);

  const list = invoices.data ?? [];
  const billable = (projects.data ?? []).filter(
    (project) => project.status === "active" || project.status === "completed",
  );
  const projectName = (id: string) => projects.data?.find((project) => project.id === id)?.name ?? "—";
  const clientName = (id: string) =>
    clients.data?.find((client) => client.id === id)?.user.displayName ?? "—";
  const sent = list.filter((invoice) => invoice.status === "sent");
  const loading = invoices.isLoading ? "…" : null;

  const lineTotal = (line: LineDraft) =>
    Math.round((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0) * 100) / 100;
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);

  function updateLine(key: number, field: keyof Omit<LineDraft, "key">, value: string) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const taxRate = String(form.get("taxRate")).trim();
    try {
      await createInvoice.mutateAsync({
        projectId: String(form.get("projectId")),
        title: String(form.get("title")).trim(),
        description: orNull(form.get("description")),
        notes: orNull(form.get("notes")),
        currency: String(form.get("currency")).trim().toUpperCase(),
        taxRate: taxRate === "" ? 0 : Number(taxRate),
        dueDate: orNull(form.get("dueDate")),
        lineItems: lines.map((line) => ({
          description: line.description.trim(),
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
        })),
      });
      setCreating(false);
    } catch {
      // Shown from createInvoice.error.
    }
  }

  async function act(invoice: Invoice, action: "send" | "mark-paid" | "void") {
    const prompts = {
      send: `Send "${invoice.title}"? It gets a number and can no longer be edited.`,
      "mark-paid": invoice.paymentReportedAt
        ? `The client reported paying "${invoice.title}"${invoice.paymentReference ? ` (ref. ${invoice.paymentReference})` : ""}. Mark it as paid now?`
        : `Mark "${invoice.title}" as paid today?`,
      void: `Void ${invoice.number ?? "this invoice"}? This can't be undone.`,
    };
    if (!window.confirm(prompts[action])) return;
    setRowError(null);
    try {
      await invoiceAction.mutateAsync({ id: invoice.id, action });
    } catch (error) {
      setRowError(apiErrorMessage(error, "Couldn't update the invoice."));
    }
  }

  async function remove(invoice: Invoice) {
    if (!window.confirm(`Delete the draft "${invoice.title}"?`)) return;
    setRowError(null);
    try {
      await deleteInvoice.mutateAsync(invoice.id);
    } catch (error) {
      setRowError(apiErrorMessage(error, "Couldn't delete the invoice."));
    }
  }

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader
        eyebrow="Invoices"
        title="Invoice List"
        action={
          <button
            type="button"
            onClick={() => {
              createInvoice.reset();
              setLines([newLine()]);
              setCreating(true);
            }}
            className={primaryButtonClass}
          >
            <ReceiptText aria-hidden="true" size={18} />
            Create invoice
          </button>
        }
      />

      <StatCards
        stats={[
          { label: "Outstanding", value: loading ?? sumByCurrency(sent), detail: `${sent.length} sent, awaiting payment`, icon: Clock3 },
          {
            label: "Overdue",
            value: loading ?? list.filter((invoice) => invoice.isOverdue).length,
            detail: "Past their due date",
            icon: ReceiptText,
          },
          {
            label: "Collected",
            value: loading ?? sumByCurrency(list.filter((invoice) => invoice.status === "paid")),
            detail: "Paid invoices",
            icon: CheckCheck,
          },
          {
            label: "Drafts",
            value: loading ?? list.filter((invoice) => invoice.status === "draft").length,
            detail: "Not sent yet",
            icon: FileText,
          },
        ]}
      />

      <Panel title="Invoices" description="Invoices are for active or completed projects.">
        {rowError && (
          <p role="alert" className="px-5 pt-4 text-sm text-destructive">
            {rowError}
          </p>
        )}
        <ListState
          isLoading={invoices.isLoading}
          error={invoices.error ? apiErrorMessage(invoices.error, "Couldn't load invoices.") : null}
          isEmpty={list.length === 0}
          emptyText="No invoices yet."
        />
        {list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {list.map((invoice) => (
                  <tr key={invoice.id} className="align-middle">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{invoice.number ?? "Draft"}</p>
                      <p className="text-xs text-muted-foreground">{invoice.title}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{clientName(invoice.clientId)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{projectName(invoice.projectId)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(invoice.issueDate)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                    <td className="px-5 py-4 font-medium tabular-nums">{formatMoney(invoice.total, invoice.currency)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.isOverdue ? "overdue" : invoice.status} />
                      {invoice.status === "sent" && invoice.paymentReportedAt && (
                        <p className="mt-1 max-w-[14rem] text-xs text-sky-700">
                          Client reports paid {formatDate(invoice.paymentReportedAt)}
                          {invoice.paymentReference ? ` · ref. ${invoice.paymentReference}` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {invoice.status === "draft" && (
                          <>
                            <button type="button" className={smallButtonClass} onClick={() => act(invoice, "send")}>
                              Send
                            </button>
                            <button type="button" className={smallButtonClass} onClick={() => remove(invoice)}>
                              <Trash2 aria-hidden="true" size={14} />
                              Delete
                            </button>
                          </>
                        )}
                        {invoice.status === "sent" && (
                          <>
                            <button type="button" className={smallButtonClass} onClick={() => act(invoice, "mark-paid")}>
                              Mark paid
                            </button>
                            <button type="button" className={smallButtonClass} onClick={() => act(invoice, "void")}>
                              Void
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {creating && (
        <Modal title="Create invoice" eyebrow="Invoices" onClose={() => setCreating(false)} wide>
          <form className="space-y-4" onSubmit={handleCreate}>
            <Field
              label="Project"
              hint={billable.length === 0 && !projects.isLoading ? "No active or completed projects yet. A project becomes active when its client accepts a proposal." : undefined}
            >
              <select name="projectId" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Choose a project
                </option>
                {billable.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} — {clientName(project.clientId)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input name="title" required maxLength={200} pattern=".*\S.*" placeholder="Deposit for website redesign" className={inputClass} />
            </Field>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Line items</legend>
              {lines.map((line, index) => (
                <div key={line.key} className="grid grid-cols-[1fr_5rem_7rem_auto] items-end gap-2">
                  <input
                    aria-label={`Line ${index + 1} description`}
                    required
                    maxLength={500}
                    pattern=".*\S.*"
                    placeholder="Description"
                    value={line.description}
                    onChange={(event) => updateLine(line.key, "description", event.target.value)}
                    className={inputClass}
                  />
                  <input
                    aria-label={`Line ${index + 1} quantity`}
                    type="number"
                    required
                    min={0.01}
                    max={99999999.99}
                    step={0.01}
                    value={line.quantity}
                    onChange={(event) => updateLine(line.key, "quantity", event.target.value)}
                    className={inputClass}
                  />
                  <input
                    aria-label={`Line ${index + 1} unit price`}
                    type="number"
                    required
                    min={0}
                    max={9999999999.99}
                    step={0.01}
                    placeholder="Unit price"
                    value={line.unitPrice}
                    onChange={(event) => updateLine(line.key, "unitPrice", event.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    aria-label={`Remove line ${index + 1}`}
                    disabled={lines.length === 1}
                    onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
                    className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={lines.length >= 100}
                  onClick={() => setLines((current) => [...current, newLine()])}
                  className={smallButtonClass}
                >
                  <Plus aria-hidden="true" size={14} />
                  Add line
                </button>
                <p className="text-sm text-muted-foreground">
                  Subtotal <span className="font-semibold text-foreground tabular-nums">{subtotal.toFixed(2)}</span>
                </p>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Currency" hint="3-letter code">
                <input
                  name="currency"
                  required
                  defaultValue="USD"
                  maxLength={3}
                  pattern="[A-Za-z]{3}"
                  className={`${inputClass} uppercase`}
                />
              </Field>
              <Field label="Tax rate (%)">
                <input name="taxRate" type="number" min={0} max={100} step={0.01} defaultValue={0} className={inputClass} />
              </Field>
              <Field label="Due date" hint="Default: 14 days after sending">
                <input name="dueDate" type="date" className={inputClass} />
              </Field>
            </div>
            <Field label="Description (optional)">
              <textarea name="description" rows={2} maxLength={10000} className={inputClass} />
            </Field>
            <Field label="Notes (optional)" hint="e.g. payment instructions">
              <textarea name="notes" rows={2} maxLength={10000} className={inputClass} />
            </Field>

            <FormActions
              onCancel={() => setCreating(false)}
              pending={createInvoice.isPending}
              submitLabel="Save draft"
              error={createInvoice.error ? apiErrorMessage(createInvoice.error, "Couldn't create the invoice.") : null}
            />
          </form>
        </Modal>
      )}
    </main>
  );
}
