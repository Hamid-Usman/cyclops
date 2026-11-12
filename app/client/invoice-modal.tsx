"use client";

import { CheckCircle2, Printer } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/services/api";
import { useClientOverviewQuery, useReportPaymentMutation } from "@/services/clients";
import type { Invoice } from "@/services/types";
import { Field, formatDate, formatMoney, FormActions, inputClass, Modal, orNull, StatusBadge } from "../panel/ui";

/**
 * An invoice sent to the client: line items and totals, printing, and a way
 * to tell the sender it has been paid.
 */
export default function InvoiceModal({ id, onClose }: { id: string; onClose: () => void }) {
  const overview = useClientOverviewQuery();
  const report = useReportPaymentMutation();
  const [reporting, setReporting] = useState(false);
  const invoice = overview.data?.invoices.find((item) => item.id === id);

  async function handleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await report.mutateAsync({ id, reference: orNull(form.get("reference")) });
      setReporting(false);
    } catch {
      // Shown from report.error.
    }
  }

  if (!invoice) {
    return (
      <Modal title="Invoice" eyebrow="Invoice" onClose={onClose}>
        <p className="text-sm text-muted-foreground">{overview.isLoading ? "Loading…" : "Invoice not found."}</p>
      </Modal>
    );
  }

  const canReport = invoice.status === "sent";
  return (
    <Modal title={`${invoice.number} · ${invoice.title}`} eyebrow="Invoice" onClose={onClose} wide>
      {reporting ? (
        <form className="space-y-4" onSubmit={handleReport}>
          <p className="text-sm text-muted-foreground">
            Let the sender know you&apos;ve paid{" "}
            <strong className="text-foreground">{formatMoney(invoice.total, invoice.currency)}</strong>. They&apos;ll
            confirm it once the money arrives.
          </p>
          <Field label="Payment reference (optional)" hint="e.g. the bank transfer reference or receipt number">
            <input
              name="reference"
              maxLength={200}
              defaultValue={invoice.paymentReference ?? ""}
              className={inputClass}
            />
          </Field>
          <FormActions
            onCancel={() => setReporting(false)}
            pending={report.isPending}
            submitLabel="I've paid this"
            error={report.error ? apiErrorMessage(report.error, "Couldn't report the payment.") : null}
          />
        </form>
      ) : (
        <>
          <InvoiceDetails invoice={invoice} />
          <div className="mt-6 flex flex-wrap justify-end gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="mr-auto inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Printer aria-hidden="true" size={16} />
              Print
            </button>
            {canReport && (
              <button
                type="button"
                onClick={() => {
                  report.reset();
                  setReporting(true);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {invoice.paymentReportedAt ? "Update payment report" : "I've paid this"}
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  const money = (amount: number) => formatMoney(amount, invoice.currency);
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={invoice.isOverdue ? "overdue" : invoice.status} />
        <span className="text-muted-foreground">Issued {formatDate(invoice.issueDate)}</span>
        <span className="text-muted-foreground">Due {formatDate(invoice.dueDate)}</span>
        {invoice.paidAt && <span className="text-muted-foreground">Paid {formatDate(invoice.paidAt)}</span>}
      </div>

      {invoice.status === "sent" && invoice.paymentReportedAt && (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-sky-500/10 p-3 text-sky-700">
          <CheckCircle2 aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
          <span>
            You reported paying this on {formatDate(invoice.paymentReportedAt)}
            {invoice.paymentReference ? ` (ref. ${invoice.paymentReference})` : ""}. Waiting for the sender to confirm.
          </span>
        </p>
      )}

      {invoice.description && <p className="whitespace-pre-wrap text-muted-foreground">{invoice.description}</p>}

      <table className="min-w-full text-left">
        <thead className="text-muted-foreground">
          <tr className="border-b border-border">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit price</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70 tabular-nums">
          {invoice.lineItems.map((line) => (
            <tr key={line.id}>
              <td className="py-2">{line.description}</td>
              <td className="py-2 text-right">{line.quantity}</td>
              <td className="py-2 text-right">{money(line.unitPrice)}</td>
              <td className="py-2 text-right">{money(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto grid max-w-xs grid-cols-2 gap-y-1 tabular-nums">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="text-right">{money(invoice.amount)}</dd>
        <dt className="text-muted-foreground">Tax ({invoice.taxRate}%)</dt>
        <dd className="text-right">{money(invoice.taxAmount)}</dd>
        <dt className="font-semibold">Total</dt>
        <dd className="text-right font-semibold">{money(invoice.total)}</dd>
      </dl>

      {invoice.notes && (
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="font-medium">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
