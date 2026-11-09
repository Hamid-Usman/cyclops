import {
    Activity,
    CircleAlert,
    Clock,
    FileText,
    FolderPlus,
    Handshake,
    ReceiptText,
    Target,
    UserPlus,
    Users,
} from "lucide-react";

const stats = [
    { label: "Active Clients", value: "4", detail: "2 since last month", icon: Users },
    { label: "Active Projects", value: "3", detail: "1 since last month", icon: Target },
    { label: "Accepted Invoices", value: "3", detail: "0 since last month", icon: Handshake },
    { label: "Pending Invoices", value: "1", detail: "0 since last month", icon: Clock },
];

const quickActions = [
    { label: "Add client", icon: UserPlus },
    { label: "Start a project", icon: FolderPlus },
    { label: "Create invoice", icon: ReceiptText },
    { label: "Send a proposal", icon: FileText },
];

const attentionItems = [
    { project: "Web Development", client: "Aculite Ltd", amount: "₦150,000" },
    { project: "Web Development", client: "Aculite Ltd", amount: "₦150,000" },
];

export default function Page() {
    return (
        <main className="flex flex-col gap-8 pb-8">
            <header className="border-b border-border pb-5">
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Welcome back, Hamid. Here&apos;s your latest overview.
                </p>
            </header>

            <section aria-label="Business overview">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    {quickActions.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Icon aria-hidden="true" className="text-primary" size={20} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section
                    className="min-w-0 rounded-xl border border-border bg-card shadow-sm"
                    aria-labelledby="attention-heading"
                >
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <h2 id="attention-heading" className="text-base font-semibold">
                                Attention required
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Invoices that need a follow-up
                            </p>
                        </div>
                        <button className="hover:cursor-pointer px-4 py-1 bg-primary rounded-xl text-white">View More</button>
                    </div>
                    <ul className="divide-y divide-border">
                        {attentionItems.map((item, index) => (
                            <li
                                key={`${item.client}-${item.project}-${index}`}
                                className="flex items-center justify-between gap-4 px-5 py-4"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <CircleAlert
                                        aria-hidden="true"
                                        className="mt-0.5 shrink-0 text-destructive"
                                        size={18}
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">Invoice overdue</p>
                                        <p className="mt-1 truncate text-sm text-muted-foreground">
                                            {item.project} · {item.client}
                                        </p>
                                    </div>
                                </div>
                                <p className="shrink-0 text-sm font-semibold tabular-nums">
                                    {item.amount}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    className="min-w-0 rounded-xl border border-border bg-card shadow-sm"
                    aria-labelledby="activity-heading"
                >
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <h2 id="activity-heading" className="text-base font-semibold">
                                Recent activity
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                The latest updates from your workspace
                            </p>
                        </div>
                        <button className="hover:cursor-pointer px-4 py-1 bg-primary rounded-xl text-white">View More</button>
                    </div>
                    <div className="flex items-start gap-3 px-5 py-4">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Activity aria-hidden="true" size={18} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-medium">Invoice overdue</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Web Development · Aculite Ltd
                            </p>
                            <p className="mt-2 text-sm font-semibold tabular-nums">₦150,000</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 px-5 py-4">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Activity aria-hidden="true" size={18} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-medium">Invoice overdue</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Web Development · Aculite Ltd
                            </p>
                            <p className="mt-2 text-sm font-semibold tabular-nums">₦150,000</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
