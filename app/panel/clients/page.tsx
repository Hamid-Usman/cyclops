"use client";

import {
    Activity,
    ArrowUpRight,
    BriefcaseBusiness,
    Clock,
    FileText,
    FolderPlus,
    Handshake,
    ReceiptText,
    Target,
    TrendingUp,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

const summaryStats = [
    { label: "Active Clients", value: "24", detail: "6 in the last 30 days", icon: Users },
    { label: "Projects in motion", value: "12", detail: "3 reached delivery", icon: BriefcaseBusiness },
    { label: "Accepted invoices", value: "18", detail: "₦1.4M this quarter", icon: Handshake },
    { label: "Pending follow-up", value: "4", detail: "2 due this week", icon: Clock },
];

const quickActions = [
    { type: "add-client", label: "Add client", icon: UserPlus },
    { type: "new-project", label: "New project", icon: FolderPlus },
    { type: "create-invoice", label: "Create invoice", icon: ReceiptText },
    { type: "send-proposal", label: "Send proposal", icon: FileText },
] as const;

const initialClients = [
    {
        name: "Hamid Usman",
        company: "Aculite Ltd",
        location: "Nigeria",
        status: "Active",
        projects: 2,
        balance: "₦215,000",
        lastInvoice: "Paid • 12 Sep",
        accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
        name: "Leah Brooks",
        company: "Northwind Studio",
        location: "United Kingdom",
        status: "Onboarding",
        projects: 1,
        balance: "₦84,500",
        lastInvoice: "Pending • 18 Sep",
        accent: "bg-amber-500/10 text-amber-600",
    },
    {
        name: "Mason Green",
        company: "Horizon Labs",
        location: "Canada",
        status: "Active",
        projects: 3,
        balance: "₦360,000",
        lastInvoice: "Paid • 09 Sep",
        accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
        name: "Joy Okafor",
        company: "Sapphire Works",
        location: "Nigeria",
        status: "Review",
        projects: 1,
        balance: "₦52,000",
        lastInvoice: "Due • 22 Sep",
        accent: "bg-sky-500/10 text-sky-600",
    },
];

const initialActivity = [
    { title: "Proposal accepted", detail: "Northwind Studio approved revised homepage scope", time: "2h ago", icon: Activity },
    { title: "Invoice due soon", detail: "Sapphire Works payment is due in 3 days", time: "Today", icon: ReceiptText },
    { title: "Milestone delivered", detail: "Horizon Labs approved UI design milestone", time: "Yesterday", icon: Target },
];

const defaultFormState = {
    name: "",
    company: "",
    location: "Nigeria",
    project: "",
    amount: "",
    status: "Active",
};

type ActionType = (typeof quickActions)[number]["type"];

type FormState = typeof defaultFormState;

function getFormFields(action: ActionType) {
    switch (action) {
        case "add-client":
            return [
                { key: "name", label: "Client name", type: "text", placeholder: "Jane Doe" },
                { key: "company", label: "Company", type: "text", placeholder: "Acme Studio" },
                { key: "location", label: "Country", type: "text", placeholder: "Nigeria" },
                { key: "status", label: "Status", type: "select", options: ["Active", "Onboarding", "Review"] },
            ] as const;
        case "new-project":
            return [
                { key: "name", label: "Project name", type: "text", placeholder: "Website redesign" },
                { key: "company", label: "Client", type: "text", placeholder: "Aculite Ltd" },
                { key: "status", label: "Project status", type: "select", options: ["Active", "Review", "On track"] },
            ] as const;
        case "create-invoice":
            return [
                { key: "company", label: "Client", type: "text", placeholder: "Aculite Ltd" },
                { key: "amount", label: "Amount", type: "text", placeholder: "₦150,000" },
                { key: "project", label: "Project", type: "text", placeholder: "Brand refresh" },
            ] as const;
        case "send-proposal":
            return [
                { key: "company", label: "Client", type: "text", placeholder: "Northwind Studio" },
                { key: "project", label: "Proposal title", type: "text", placeholder: "Homepage redesign" },
                { key: "status", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
            ] as const;
        default:
            return [] as const;
    }
}

export default function Page() {
    const [clientsList, setClientsList] = useState(initialClients);
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

        if (action === "add-client") {
            const newClient = {
                name: formValues.name.trim() || "New client",
                company: formValues.company.trim() || "New company",
                location: formValues.location.trim() || "Nigeria",
                status: formValues.status || "Active",
                projects: 0,
                balance: "₦0",
                lastInvoice: "New client",
                accent:
                    formValues.status === "Onboarding"
                        ? "bg-amber-500/10 text-amber-600"
                        : formValues.status === "Review"
                            ? "bg-sky-500/10 text-sky-600"
                            : "bg-emerald-500/10 text-emerald-600",
            };

            setClientsList((current) => [newClient, ...current]);
            setActivityFeed((current) => [
                {
                    title: "Client added",
                    detail: `${newClient.name} was added to the client directory`,
                    time: "Just now",
                    icon: UserPlus,
                },
                ...current,
            ].slice(0, 4));
        }

        if (action === "new-project") {
            const projectName = formValues.name.trim() || "New project";
            const clientName = formValues.company.trim() || "Aculite Ltd";

            setActivityFeed((current) => [
                {
                    title: "Project created",
                    detail: `${projectName} was added for ${clientName}`,
                    time: "Just now",
                    icon: FolderPlus,
                },
                ...current,
            ].slice(0, 4));
        }

        if (action === "create-invoice") {
            const clientName = formValues.company.trim() || "Aculite Ltd";
            const amount = formValues.amount.trim() || "₦0";
            const projectName = formValues.project.trim() || "Project";

            setActivityFeed((current) => [
                {
                    title: "Invoice created",
                    detail: `${projectName} invoice for ${clientName} was prepared for ${amount}`,
                    time: "Just now",
                    icon: ReceiptText,
                },
                ...current,
            ].slice(0, 4));
        }

        if (action === "send-proposal") {
            const clientName = formValues.company.trim() || "Northwind Studio";
            const proposalName = formValues.project.trim() || "Proposal";

            setActivityFeed((current) => [
                {
                    title: "Proposal sent",
                    detail: `${proposalName} was sent to ${clientName}`,
                    time: "Just now",
                    icon: FileText,
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
                        Clients
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">Client List</h1>
                </div>
                <button
                    type="button"
                    onClick={() => openAction("add-client")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                    <UserPlus aria-hidden="true" size={18} />
                    Add client
                </button>
            </header>

            <section aria-label="Client overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            <section className="flex flex-col gap-4" aria-labelledby="client-quick-actions-heading">
                <div>
                    <h2 id="client-quick-actions-heading" className="text-lg font-semibold tracking-tight">
                        Quick actions
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Keep client work moving.</p>
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
                        <h2 className="text-base font-semibold">Client directory</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Track your active and upcoming work.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-primary">
                            <TrendingUp aria-hidden="true" size={14} />
                            +14% this month
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-muted/60 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3 font-medium">Client</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Projects</th>
                                <th className="px-5 py-3 font-medium">Country</th>
                                <th className="px-5 py-3 font-medium">Last invoice</th>
                                <th className="px-5 py-3 font-medium">Balance</th>
                                <th className="px-5 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/80">
                            {clientsList.map(({ name, company, location, status, projects, balance, lastInvoice, accent }) => (
                                <tr key={`${name}-${company}`} className="align-middle">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                {name
                                                    .split(" ")
                                                    .map((part) => part[0])
                                                    .slice(0, 2)
                                                    .join("")}
                                            </span>
                                            <div>
                                                <p className="font-medium text-foreground">{name}</p>
                                                <p className="text-xs text-muted-foreground">{company}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${accent}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 tabular-nums text-muted-foreground">{projects}</td>
                                    <td className="px-5 py-4 text-muted-foreground">{location}</td>
                                    <td className="px-5 py-4 text-muted-foreground">{lastInvoice}</td>
                                    <td className="px-5 py-4 font-medium text-foreground">{balance}</td>
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
                            <h2 className="text-base font-semibold">Recent activity</h2>
                            <p className="mt-1 text-sm text-muted-foreground">This week’s client updates</p>
                        </div>
                        <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                            View all
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
                    <h2 className="text-base font-semibold">Follow-up queue</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Invoices and check-ins needing attention.</p>

                    <ul className="mt-5 space-y-3">
                        {[
                            { client: "Aculite Ltd", amount: "₦150,000", label: "Payment reminder" },
                            { client: "Sapphire Works", amount: "₦52,000", label: "Project review" },
                            { client: "Northwind Studio", amount: "₦84,500", label: "Revision call" },
                        ].map(({ client, amount, label }) => (
                            <li key={client} className="flex items-start justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 p-3">
                                <div>
                                    <p className="text-sm font-medium">{client}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{amount}</span>
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
