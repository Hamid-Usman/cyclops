"use client";

import { CheckCheck, Clock3, ReceiptText } from "lucide-react";
import { useState } from "react";
import { apiErrorMessage } from "@/services/api";
import { useClientOverviewQuery } from "@/services/clients";
import type { Invoice } from "@/services/types";
import {
  formatDate,
  formatMoney,
  ListState,
  PageHeader,
  Panel,
  smallButtonClass,
  StatCards,
  StatusBadge,
} from "../../panel/ui";
import InvoiceModal from "../invoice-modal";

function sumByCurrency(invoices: Invoice[]) {
  const totals = new Map<string, number>();
  for (const invoice of invoices) {
    totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + Math.round(invoice.total * 100));
  }
  if (totals.size === 0) return formatMoney(0);
  return [...totals].map(([currency, cents]) => formatMoney(cents / 100, currency)).join(" · ");
}

export default function Page() {
  const overview = useClientOverviewQuery();
  const [openId, setOpenId] = useState<string | null>(null);
  const invoices = overview.data?.invoices ?? [];
  const unpaid = invoices.filter((invoice) => invoice.status === "sent");
  const paid = invoices.filter((invoice) => invoice.status === "paid");
  const loading = overview.isLoading ? "…" : null;

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader eyebrow="Client" title="Invoices" />

      <StatCards
        stats={[
          { label: "To pay", value: loading ?? sumByCurrency(unpaid), detail: `${unpaid.length} unpaid`, icon: Clock3 },
          {
            label: "Overdue",
            value: loading ?? unpaid.filter((invoice) => invoice.isOverdue).length,
            detail: "Past their due date",
            icon: ReceiptText,
          },
          { label: "Paid", value: loading ?? sumByCurrency(paid), detail: `${paid.length} invoices`, icon: CheckCheck },
        ]}
      />

      <Panel title="Invoices sent to you" description="Open one to see the details, print it, or tell the sender you've paid.">
        <ListState
          isLoading={overview.isLoading}
          error={overview.error ? apiErrorMessage(overview.error, "Couldn't load your invoices.") : null}
          isEmpty={invoices.length === 0}
          emptyText="No invoices have been sent to you yet."
        />
        {invoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">{invoice.title}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(invoice.issueDate)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                    <td className="px-5 py-4 font-medium tabular-nums">{formatMoney(invoice.total, invoice.currency)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={invoice.isOverdue ? "overdue" : invoice.status} />
                        {invoice.status === "sent" && invoice.paymentReportedAt && (
                          <span className="text-xs text-sky-700">Payment reported</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" className={smallButtonClass} onClick={() => setOpenId(invoice.id)}>
                        {invoice.status === "sent" && !invoice.paymentReportedAt ? "View & pay" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {openId && <InvoiceModal id={openId} onClose={() => setOpenId(null)} />}
    </main>
  );
}
