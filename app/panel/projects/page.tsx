"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

const summaryStats = [
  { label: "Active projects", value: "12", detail: "3 due this month", icon: BriefcaseBusiness },
  { label: "In progress", value: "7", detail: "2 behind schedule", icon: FolderKanban },
  { label: "Completed", value: "18", detail: "4 this quarter", icon: CheckCircle2 },
  { label: "Avg. delivery", value: "8.4d", detail: "Across all active work", icon: CalendarClock },
];

const quickActions = [
  { type: "add-project", label: "Add project", icon: FolderKanban },
  { type: "review-milestones", label: "Review milestones", icon: Target },
  { type: "update-status", label: "Update status", icon: TrendingUp },
  { type: "prepare-invoice", label: "Prepare invoice", icon: Sparkles },
] as const;

const initialProjects = [
  {
    name: "Brand refresh",
    client: "Aculite Ltd",
    timeline: "Aug 02 — Sep 18",
    progress: 82,
    budget: "₦480,000",
    status: "On track",
    accent: "bg-emerald-500/10 text-emerald-600",
  },
  {
    name: "Website renewal",
    client: "Northwind Studio",
    timeline: "Sep 10 — Nov 02",
    progress: 56,
    budget: "₦610,000",
    status: "Active",
    accent: "bg-sky-500/10 text-sky-600",
  },
  {
    name: "CRM setup",
    client: "Horizon Labs",
    timeline: "Sep 12 — Oct 21",
    progress: 71,
    budget: "₦420,000",
    status: "Review",
    accent: "bg-amber-500/10 text-amber-600",
  },
  {
    name: "Landing page sprint",
    client: "Sapphire Works",
    timeline: "Aug 26 — Sep 20",
    progress: 93,
    budget: "₦230,000",
    status: "Finalising",
    accent: "bg-violet-500/10 text-violet-600",
  },
];

const initialActivity = [
  { title: "Design review completed", detail: "Brand refresh concept was approved with minor revisions", time: "2h ago", icon: CheckCircle2 },
  { title: "Timeline updated", detail: "Website renewal moved to a new internal QA phase", time: "Today", icon: CalendarClock },
  { title: "Milestone delivered", detail: "Landing page sprint reached final approval stage", time: "Yesterday", icon: Target },
];

const defaultFormState = {
  name: "",
  client: "",
  timeline: "",
  budget: "",
  status: "Active",
  milestone: "",
};

type ActionType = (typeof quickActions)[number]["type"];
type FormState = typeof defaultFormState;

function getFormFields(action: ActionType) {
  switch (action) {
    case "add-project":
      return [
        { key: "name", label: "Project name", type: "text", placeholder: "Website redesign" },
        { key: "client", label: "Client", type: "text", placeholder: "Aculite Ltd" },
        { key: "timeline", label: "Timeline", type: "text", placeholder: "Sep 10 — Nov 02" },
        { key: "budget", label: "Budget", type: "text", placeholder: "₦300,000" },
        { key: "status", label: "Status", type: "select", options: ["Active", "On track", "Review", "Finalising"] },
      ] as const;
    case "review-milestones":
      return [
        { key: "name", label: "Project", type: "text", placeholder: "Brand refresh" },
        { key: "milestone", label: "Milestone", type: "text", placeholder: "Homepage prototype" },
        { key: "status", label: "Review status", type: "select", options: ["Ready for review", "Waiting on client input", "In progress"] },
      ] as const;
    case "update-status":
      return [
        { key: "name", label: "Project", type: "text", placeholder: "Website renewal" },
        { key: "status", label: "New status", type: "select", options: ["Active", "On track", "Review", "Finalising"] },
        { key: "timeline", label: "Updated timeline", type: "text", placeholder: "Sep 18 — Oct 12" },
      ] as const;
    case "prepare-invoice":
      return [
        { key: "client", label: "Client", type: "text", placeholder: "Northwind Studio" },
        { key: "budget", label: "Amount", type: "text", placeholder: "₦250,000" },
        { key: "name", label: "Project", type: "text", placeholder: "Website renewal" },
      ] as const;
    default:
      return [] as const;
  }
}

export default function Page() {
  const [projectsList, setProjectsList] = useState(initialProjects);
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

    if (action === "add-project") {
      const projectName = formValues.name.trim() || "New project";
      const clientName = formValues.client.trim() || "Aculite Ltd";
      const timelineValue = formValues.timeline.trim() || "Sep 01 — Oct 15";
      const budgetValue = formValues.budget.trim() || "₦0";
      const statusValue = formValues.status || "Active";

      const newProject = {
        name: projectName,
        client: clientName,
        timeline: timelineValue,
        progress: 0,
        budget: budgetValue,
        status: statusValue,
        accent:
          statusValue === "Finalising"
            ? "bg-violet-500/10 text-violet-600"
            : statusValue === "Review"
              ? "bg-amber-500/10 text-amber-600"
              : "bg-sky-500/10 text-sky-600",
      };

      setProjectsList((current) => [newProject, ...current]);
      setActivityFeed((current) => [
        {
          title: "Project created",
          detail: `${projectName} was added for ${clientName}`,
          time: "Just now",
          icon: FolderKanban,
        },
        ...current,
      ].slice(0, 4));
    }

    if (action === "review-milestones") {
      const projectName = formValues.name.trim() || "Project";
      const milestoneName = formValues.milestone.trim() || "Delivery milestone";
      const statusValue = formValues.status || "Ready for review";

      setActivityFeed((current) => [
        {
          title: "Milestone reviewed",
          detail: `${milestoneName} for ${projectName} is ${statusValue.toLowerCase()}`,
          time: "Just now",
          icon: Target,
        },
        ...current,
      ].slice(0, 4));
    }

    if (action === "update-status") {
      const projectName = formValues.name.trim() || "Project";
      const newStatus = formValues.status || "Active";
      const timelineValue = formValues.timeline.trim() || "Sep 01 — Oct 15";

      setProjectsList((current) =>
        current.map((project) =>
          project.name.toLowerCase() === projectName.toLowerCase()
            ? {
                ...project,
                status: newStatus,
                timeline: timelineValue,
                accent:
                  newStatus === "Finalising"
                    ? "bg-violet-500/10 text-violet-600"
                    : newStatus === "Review"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-sky-500/10 text-sky-600",
              }
            : project,
        ),
      );

      setActivityFeed((current) => [
        {
          title: "Status updated",
          detail: `${projectName} is now marked as ${newStatus}`,
          time: "Just now",
          icon: TrendingUp,
        },
        ...current,
      ].slice(0, 4));
    }

    if (action === "prepare-invoice") {
      const clientName = formValues.client.trim() || "Northwind Studio";
      const amountValue = formValues.budget.trim() || "₦0";
      const projectName = formValues.name.trim() || "Project";

      setActivityFeed((current) => [
        {
          title: "Invoice prepared",
          detail: `${projectName} invoice for ${clientName} is ready for ${amountValue}`,
          time: "Just now",
          icon: Sparkles,
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
            Projects
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Project overview</h1>
        </div>
        <button
          type="button"
          onClick={() => openAction("add-project")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <FolderKanban aria-hidden="true" size={18} />
          New project
        </button>
      </header>

      <section aria-label="Project overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="flex flex-col gap-4" aria-labelledby="project-quick-actions-heading">
        <div>
          <h2 id="project-quick-actions-heading" className="text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Move work forward without losing momentum.</p>
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
            <h2 className="text-base font-semibold">Current projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Live delivery status across your client work.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-sm text-primary">
            <TrendingUp aria-hidden="true" size={14} />
            +12% delivery pace
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Timeline</th>
                <th className="px-5 py-3 font-medium">Progress</th>
                <th className="px-5 py-3 font-medium">Budget</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {projectsList.map(({ name, client, timeline, progress, budget, status, accent }) => (
                <tr key={name} className="align-middle">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Design and product work</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{client}</td>
                  <td className="px-5 py-4 text-muted-foreground">{timeline}</td>
                  <td className="px-5 py-4">
                    <div className="w-40">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress}%</span>
                        <span>Completed</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-foreground">{budget}</td>
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
              <h2 className="text-base font-semibold">Project activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest movement across your delivery pipeline.</p>
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
          <h2 className="text-base font-semibold">Milestone status</h2>
          <p className="mt-1 text-sm text-muted-foreground">The work that needs attention before the next review.</p>

          <ul className="mt-5 space-y-3">
            {[
              { title: "Homepage wireframes", client: "Aculite Ltd", status: "Ready for review" },
              { title: "CRM integration", client: "Horizon Labs", status: "Waiting on client input" },
              { title: "SEO content pass", client: "Northwind Studio", status: "In progress" },
            ].map(({ title, client, status }) => (
              <li key={title} className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{title}</p>
                  <span className="text-xs text-muted-foreground">{status}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{client}</p>
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
