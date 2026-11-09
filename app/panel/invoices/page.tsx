"use client";

import {
  ArrowUpRight,
  CheckCheck,
  CircleDollarSign,
  Clock3,
  FileText,
  ReceiptText,
  TrendingUp,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

const summaryStats = [
  { label: "Total billed", value: "₦1.8M", detail: "Across 28 invoices", icon: CircleDollarSign },
  { label: "Collected", value: "₦1.3M", detail: "71% of total", icon: CheckCheck },
  { label: "Outstanding", value: "₦420K", detail: "6 invoices open", icon: ReceiptText },
  { label: "Due this month", value: "₦260K", detail: "3 reminders scheduled", icon: Clock3 },
];

const quickActions = [
  { type: "create-invoice", label: "Create invoice", icon: ReceiptText },
  { type: "send-reminder", label: "Send reminder", icon: FileText },
  { type: "export-report", label: "Export report", icon: TrendingUp },
  { type: "record-payment", label: "Record payment", icon: CheckCheck },
] as const;

const initialInvoices = [
  {
    number: "INV-2048",
    client: "Aculite Ltd",
    project: "Brand refresh",
    issued: "14 Aug",
    due: "26 Sep",
    amount: "₦180,000",
    status: "Paid",
    accent: "bg-emerald-500/10 text-emerald-600",
  },
  {
    number: "INV-1967",
    client: "Northwind Studio",
    project: "Website renewal",
    issued: "04 Sep",
    due: "19 Sep",
    amount: "₦210,000",
    status: "Due soon",
    accent: "bg-amber-500/10 text-amber-600",
  },
  {
    number: "INV-1951",
    client: "Horizon Labs",
    project: "CRM setup",
    issued: "20 Aug",
    due: "10 Sep",
    amount: "₦160,000",
    status: "Overdue",
    accent: "bg-red-500/10 text-red-600",
  },
  {
    number: "INV-1924",
    client: "Sapphire Works",
    project: "Landing page sprint",
    issued: "08 Sep",
    due: "22 Sep",
    amount: "₦95,000",
    status: "Draft",
    accent: "bg-sky-500/10 text-sky-600",
  },
];

const initialActivity = [
  { title: "Payment received", detail: "Aculite Ltd settled invoice INV-2048 in full", time: "Today", icon: CheckCheck },
  { title: "Reminder sent", detail: "Northwind Studio received a payment follow-up", time: "Yesterday", icon: FileText },
  { title: "Invoice approved", detail: "Sapphire Works approved the final draft invoice", time: "2 days ago", icon: ReceiptText },
];

const defaultFormState = {
  number: "",
  client: "",
  project: "",
  amount: "",
  due: "",
  status: "Paid",
};

type ActionType = (typeof quickActions)[number]["type"];
type FormState = typeof defaultFormState;

function getFormFields(action: ActionType) {
  switch (action) {
    case "create-invoice":
      return [
        { key: "number", label: "Invoice number", type: "text", placeholder: "INV-2050" },
        { key: "client", label: "Client", type: "text", placeholder: "Aculite Ltd" },
        { key: "project", label: "Project", type: "text", placeholder: "Brand refresh" },
        { key: "amount", label: "Amount", type: "text", placeholder: "₦180,000" },
        { key: "due", label: "Due date", type: "text", placeholder: "26 Sep" },
      ] as const;
    case "send-reminder":
      return [
        { key: "client", label: "Client", type: "text", placeholder: "Northwind Studio" },
        { key: "amount", label: "Amount", type: "text", placeholder: "₦210,000" },
        { key: "status", label: "Reminder type", type: "select", options: ["Payment reminder", "Follow-up", "Urgent notice"] },
      ] as const;
    case "export-report":
      return [
        { key: "status", label: "Report type", type: "select", options: ["Monthly summary", "Aged receivables", "Collections report"] },
        { key: "due", label: "Date range", type: "text", placeholder: "Sep 2026" },
      ] as const;
    case "record-payment":
      return [
        { key: "client", label: "Client", type: "text", placeholder: "Aculite Ltd" },
        { key: "amount", label: "Paid amount", type: "text", placeholder: "₦180,000" },
        { key: "status", label: "Status", type: "select", options: ["Paid", "Partially paid", "Overdue"] },
      ] as const;
    default:
      return [] as const;
  }
}

export default function Page() {
  const [invoiceList, setInvoiceList] = useState(initialInvoices);
  const [activityFeed, setActivityFeed] = useState(initialActivity);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [formValues, setFormValues] = useState<FormState>(defaultFormState);

  const openAction = (action: ActionType) => {
    setPendingAction(action);
    setFormValues(defaultFormState);
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pendingAction) {
      return;
    }

    const action = pendingAction;

    if (action === "create-invoice") {
      const numberValue = formValues.number.trim() || "INV-2050";
      const clientName = formValues.client.trim() || "Aculite Ltd";
      const projectName = formValues.project.trim() || "New project";
      const amountValue = formValues.amount.trim() || "₦0";
      const dueDate = formValues.due.trim() || "30 Sep";

      const newInvoice = {
        number: numberValue,
        client: clientName,
        project: projectName,
        issued: "Today",
        due: dueDate,
        amount: amountValue,
        status: "Draft",
        accent: "bg-sky-500/10 text-sky-600",
      };

      setInvoiceList((current) => [newInvoice, ...current]);
      setActivityFeed((current) => [
        {
          title: "Invoice created",
          detail: `${numberValue} was prepared for ${clientName}`,
          time: "Just now",
          icon: ReceiptText,
        },
        ...current,
      ].slice(0, 4));
    }

    if (action === "send-reminder") {
      const clientName = formValues.client.trim() || "Northwind Studio";
      const amountValue = formValues.amount.trim() || "₦0";
      const statusValue = formValues.status || "Payment reminder";

      setActivityFeed((current) => [
        {
          title: statusValue,
          detail: `${clientName} was reminded about ${amountValue}`,
          time: "Just now",
          icon: FileText,
        },
        ...current,
      ].slice(0, 4));
    }

    if (action === "export-report") {
      const reportType = formValues.status || "Monthly summary";
      const dateRange = formValues.due.trim() || "Sep 2026";

      setActivityFeed((current) => [
        {
          title: "Report exported",
          detail: `${reportType} for ${dateRange} was prepared`,
          time: "Just now",
          icon: TrendingUp,
        },
        ...current,
      ].slice(0, 4));
    }

    if (action === "record-payment") {
      const clientName = formValues.client.trim() || "Aculite Ltd";
      const amountValue = formValues.amount.trim() || "₦0";
      const nextStatus = formValues.status || "Paid";

      setInvoiceList((current) =>
        current.map((invoice) =>
          invoice.client.toLowerCase() === clientName.toLowerCase()
            ? {
                ...invoice,
                status: nextStatus,
                accent:
                  nextStatus === "Paid"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : nextStatus === "Partially paid"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-red-500/10 text-red-600",
              }
            : invoice,
        ),
      );

      setActivityFeed((current) => [
        {
          title: "Payment recorded",
          detail: `${clientName} recorded a payment of ${amountValue}`,
          time: "Just now",
          icon: CheckCheck,
        },
        ...current,
      ].slice(0, 4));
    }

    setPendingAction(null);
    setFormValues(defaultFormState);
  };

  return (
    <main className="flex flex-col gap-8 pb-8">
      <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Invoices
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Billing overview</h1>
        </div>
        <button
          type="button"
          onClick={() => openAction("create-invoice")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ReceiptText aria-hidden="true" size={18} />
          Create invoice
        </button>
      </header>

      <section aria-label="Invoice overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon aria-hidden="true" size={22} />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
              </div>
            </div>
            <p className="border-t border-border/70 bg-muted/50 px-5 py-2.5 text-xs text-muted-foreground">
              {detail}
            </p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="invoice-quick-actions-heading">
        <div>
          <h2 id="invoice-quick-actions-heading" className="text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep billing moving with a few clicks.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ type, label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => openAction(type)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Icon aria-hidden="true" className="text-primary" size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Invoice list</h2>
            <p className="mt-1 text-sm text-muted-foreground">Monitor payment timelines and invoice status.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-sm text-primary">
            <TrendingUp aria-hidden="true" size={14} />
            +9% collected this month
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Issued</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {invoiceList.map(({ number, client, project, issued, due, amount, status, accent }) => (
                <tr key={number} className="align-middle">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-foreground">{number}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Tax invoice</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{client}</td>
                  <td className="px-5 py-4 text-muted-foreground">{project}</td>
                  <td className="px-5 py-4 text-muted-foreground">{issued}</td>
                  <td className="px-5 py-4 text-muted-foreground">{due}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{amount}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${accent}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      View
                      <ArrowUpRight aria-hidden="true" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Payment activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">Recurring billing updates across the last 7 days.</p>
            </div>
            <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              Export
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {activityFeed.map(({ title, detail, time, icon: Icon }) => (
              <div key={`${title}-${time}`} className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-3">
                <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{time}</time>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Upcoming due dates</h2>
          <p className="mt-1 text-sm text-muted-foreground">Accounts receivable and follow-up priorities.</p>

          <ul className="mt-5 space-y-3">
            {[
              { client: "Northwind Studio", amount: "₦210,000", due: "Due in 2 days" },
              { client: "Sapphire Works", amount: "₦95,000", due: "Due in 4 days" },
              { client: "Horizon Labs", amount: "₦160,000", due: "Overdue by 2 days" },
            ].map(({ client, amount, due }) => (
              <li key={client} className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{client}</p>
                  <span className="text-sm font-semibold text-foreground">{amount}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{due}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Quick action
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  {quickActions.find((action) => action.type === pendingAction)?.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close quick action"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {getFormFields(pendingAction).map((field) => (
                <label key={field.key} className="block space-y-2 text-sm">
                  <span className="font-medium text-foreground">{field.label}</span>
                  {field.type === "select" ? (
                    <select
                      value={formValues[field.key as keyof FormState]}
                      onChange={(event) => handleFieldChange(field.key as keyof FormState, event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formValues[field.key as keyof FormState]}
                      onChange={(event) => handleFieldChange(field.key as keyof FormState, event.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    />
                  )}
                </label>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save action
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
