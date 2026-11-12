'use client'
import {
    CircleAlert,
    Clock,
    FileText,
    FolderPlus,
    ReceiptText,
    Target,
    UserPlus,
    Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { apiErrorMessage } from "@/services/api";
import { useAttentionQuery, useGetDashboardQuery } from "@/services/dashboard";
import Link from "next/link";
import { formatDate, formatMoney, ListState } from "./ui";

const quickActions = [
    { label: "Add client", href: "/panel/clients", icon: UserPlus },
    { label: "Start a project", href: "/panel/projects", icon: FolderPlus },
    { label: "Create invoice", href: "/panel/invoices", icon: ReceiptText },
    { label: "Send a proposal", href: "/panel/proposals", icon: FileText },
];

function dueLabel(daysUntilDue: number) {
    if (daysUntilDue < 0) return `${-daysUntilDue} day${daysUntilDue === -1 ? "" : "s"} overdue`;
    if (daysUntilDue === 0) return "Due today";
    return `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;
}

interface AttentionItem {
    id: string;
    title: string;
    detail: string;
    due: string;
    overdue: boolean;
    amount: string;
}

function AttentionList({
    title,
    description,
    href,
    items,
    isLoading,
    error,
    emptyText,
}: {
    title: string;
    description: string;
    href: string;
    items: AttentionItem[];
    isLoading: boolean;
    error: string | null;
    emptyText: string;
}) {
    return (
        <section className="min-w-0 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
                <Link href={href} className="shrink-0 rounded-xl bg-primary px-4 py-1 text-white">
                    View all
                </Link>
            </div>
            <ListState isLoading={isLoading} error={error} isEmpty={items.length === 0} emptyText={emptyText} />
            <ul className="divide-y divide-border">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="flex min-w-0 items-start gap-3">
                            <CircleAlert
                                aria-hidden="true"
                                className={`mt-0.5 shrink-0 ${item.overdue ? "text-destructive" : "text-amber-500"}`}
                                size={18}
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{item.title}</p>
                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {item.detail} · {item.due}
                                </p>
                            </div>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">{item.amount}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function Page() {
    const user = useAuthStore((state) => state.user)
    const { data, isLoading, error } = useGetDashboardQuery();
    const attention = useAttentionQuery(14);
    const stats = [
        {
            label: "Active Clients",
            value: isLoading ? "…" : data?.activeClients ?? "—",
            detail: "Clients currently active",
            icon: Users,
        },
        {
            label: "Active Projects",
            value: isLoading ? "…" : data?.activeProjects ?? "—",
            detail: "Projects currently active",
            icon: Target,
        },
        {
            label: "Pending Invoices",
            value: isLoading ? "…" : data?.pendingInvoices?.count ?? "—",
            detail: !data?.pendingInvoices
                ? "No pending invoice totals"
                : data.pendingInvoices.count === 0
                ? "No pending invoice totals"
                : "Invoices awaiting payment",
            icon: ReceiptText,
        },
        {
            label: "Overdue Invoices",
            value: isLoading ? "…" : data?.pendingInvoices.overdueCount ?? "—",
            detail: "Invoices past due",
            icon: Clock,
        },
        {
            label: "Proposals",
            value: isLoading ? "…" : data?.proposals?.total ?? "—",
            detail: data?.proposals
                ? `${data.proposals.drafts} draft · ${data.proposals.awaitingResponse} awaiting reply · ${data.proposals.accepted} accepted`
                : "Drafts, sent and accepted",
            icon: FileText,
        },
    ];

    return (
        <main className="flex flex-col gap-8 pb-8">
            <header className="border-b border-border pb-5">
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Welcome back, {user?.displayName ?? "User"}. Here&apos;s your latest overview.
                </p>
            </header>

            <section aria-label="Business overview">
                {error && (
                    <p className="mb-4 text-sm text-destructive" role="alert">
                        {apiErrorMessage(error, "Unable to load dashboard summary.")}
                    </p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {stats.map(({ label, value, detail, icon: Icon }) => (
                        <article
                            key={label}
                            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                        >
                            <div className="flex items-center gap-4 p-5">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon aria-hidden="true" size={22} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">{label}</p>
                                    <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                                        {value}
                                    </p>
                                </div>
                            </div>
                            <p className="border-t border-border/70 bg-muted/50 px-5 py-2.5 text-xs text-muted-foreground">
                                {detail}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="flex flex-col gap-4" aria-labelledby="quick-actions-heading">
                <div>
                    <h2 id="quick-actions-heading" className="text-lg font-semibold tracking-tight">
                        Quick actions
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pick up where you left off.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {quickActions.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={label}
                            href={href}
                            className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Icon aria-hidden="true" className="text-primary" size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <AttentionList
                    title="Attention required"
                    description="Sent invoices that are overdue or due in the next 14 days"
                    href="/panel/invoices"
                    isLoading={attention.isLoading}
                    error={attention.error ? apiErrorMessage(attention.error, "Unable to load invoices.") : null}
                    emptyText="Nothing to chase. No invoices are overdue or due soon."
                    items={(attention.data?.invoices ?? []).map((invoice) => ({
                        id: invoice.id,
                        title: `${invoice.number} · ${invoice.title}`,
                        detail: `${invoice.projectName} · ${invoice.clientName}`,
                        due: dueLabel(invoice.daysUntilDue),
                        overdue: invoice.isOverdue,
                        amount: formatMoney(invoice.total, invoice.currency),
                    }))}
                />
                <AttentionList
                    title="Projects due soon"
                    description="Active projects that are overdue or due in the next 14 days"
                    href="/panel/projects"
                    isLoading={attention.isLoading}
                    error={attention.error ? apiErrorMessage(attention.error, "Unable to load projects.") : null}
                    emptyText="No active projects are due in the next 14 days."
                    items={(attention.data?.projects ?? []).map((project) => ({
                        id: project.id,
                        title: project.name,
                        detail: project.clientName,
                        due: dueLabel(project.daysUntilDue),
                        overdue: project.isOverdue,
                        amount: formatDate(project.dueDate),
                    }))}
                />
            </div>
        </main>
    );
}
