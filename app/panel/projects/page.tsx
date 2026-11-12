"use client";

import { BriefcaseBusiness, CheckCircle2, FolderKanban, FolderPlus, Pencil, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/services/api";
import { useClientsQuery } from "@/services/clients";
import {
  useCreateProjectMutation,
  useProjectsQuery,
  useUpdateProjectMutation,
} from "@/services/projects";
import type { Project } from "@/services/types";
import ProjectMilestones from "./project-milestones";
import {
  Field,
  formatDate,
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

export default function Page() {
  const projects = useProjectsQuery();
  const clients = useClientsQuery();
  const createProject = useCreateProjectMutation();
  const updateProject = useUpdateProjectMutation();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [viewing, setViewing] = useState<Project | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const list = projects.data ?? [];
  const clientName = (id: string) =>
    clients.data?.find((client) => client.id === id)?.user.displayName ?? "Unknown client";
  const count = (status: Project["status"]) => list.filter((project) => project.status === status).length;
  const loading = projects.isLoading ? "…" : null;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createProject.mutateAsync({
        clientId: String(form.get("clientId")),
        name: String(form.get("name")).trim(),
        description: orNull(form.get("description")),
        startDate: orNull(form.get("startDate")),
        dueDate: orNull(form.get("dueDate")),
      });
      setCreating(false);
    } catch {
      // Shown from createProject.error.
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    try {
      await updateProject.mutateAsync({
        id: editing.id,
        name: String(form.get("name")).trim(),
        description: orNull(form.get("description")),
        startDate: orNull(form.get("startDate")),
        dueDate: orNull(form.get("dueDate")),
      });
      setEditing(null);
    } catch {
      // Shown from updateProject.error.
    }
  }

  async function setStatus(project: Project, status: "completed" | "cancelled") {
    const verb = status === "completed" ? "Mark as completed" : "Cancel";
    if (!window.confirm(`${verb} "${project.name}"? This can't be undone.`)) return;
    setRowError(null);
    try {
      await updateProject.mutateAsync({ id: project.id, status });
    } catch (error) {
      setRowError(apiErrorMessage(error, "Couldn't change the project status."));
    }
  }

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader
        eyebrow="Projects"
        title="Project List"
        action={
          <button
            type="button"
            onClick={() => {
              createProject.reset();
              setCreating(true);
            }}
            className={primaryButtonClass}
          >
            <FolderPlus aria-hidden="true" size={18} />
            Add project
          </button>
        }
      />

      <StatCards
        stats={[
          { label: "Active", value: loading ?? count("active"), detail: "Proposal accepted, work underway", icon: BriefcaseBusiness },
          { label: "Awaiting proposal", value: loading ?? count("inactive"), detail: "Inactive until a proposal is accepted", icon: FolderKanban },
          { label: "Completed", value: loading ?? count("completed"), detail: "Delivered", icon: CheckCircle2 },
          { label: "Cancelled", value: loading ?? count("cancelled"), detail: "Stopped", icon: XCircle },
        ]}
      />

      <Panel
        title="Projects"
        description="Projects are created when a client accepts a proposal, with milestones you can invoice. Projects you add here stay inactive until a proposal for them is accepted."
      >
        {rowError && (
          <p role="alert" className="px-5 pt-4 text-sm text-destructive">
            {rowError}
          </p>
        )}
        <ListState
          isLoading={projects.isLoading}
          error={projects.error ? apiErrorMessage(projects.error, "Couldn't load projects.") : null}
          isEmpty={list.length === 0}
          emptyText="No projects yet."
        />
        {list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Clienssst</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Start</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {list.map((project) => {
                  const open = project.status === "inactive" || project.status === "active";
                  return (
                    <tr key={project.id} className="align-middle">
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{project.name}</p>
                        {project.description && (
                          <p className="max-w-xs truncate text-xs text-muted-foreground">{project.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{clientName(project.clientId)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{formatDate(project.startDate)}</td>
                      <td className="px-5 py-4 text-muted-foreground">{formatDate(project.dueDate)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" className={smallButtonClass} onClick={() => setViewing(project)}>
                            Milestones
                          </button>
                          {project.status !== 'cancelled' && project.status !== 'completed' && (
                            
                          <button
                            type="button"
                            className={smallButtonClass}
                            onClick={() => {
                              updateProject.reset();
                              setEditing(project);
                            }}
                          >
                            <Pencil aria-hidden="true" size={14} />
                            Edit
                          </button>
                          )}
                          {project.status === "active" && (
                            <button type="button" className={smallButtonClass} onClick={() => setStatus(project, "completed")}>
                              Complete
                            </button>
                          )}
                          {open && (
                            <button type="button" className={smallButtonClass} onClick={() => setStatus(project, "cancelled")}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {creating && (
        <Modal title="Add project" eyebrow="Projects" onClose={() => setCreating(false)}>
          <form className="space-y-4" onSubmit={handleCreate}>
            <Field label="Client">
              <select name="clientId" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  {clients.isLoading ? "Loading clients…" : "Choose a client"}
                </option>
                {clients.data?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.user.displayName} ({client.user.email})
                  </option>
                ))}
              </select>
            </Field>
            <ProjectFields />
            <FormActions
              onCancel={() => setCreating(false)}
              pending={createProject.isPending}
              submitLabel="Create project"
              error={createProject.error ? apiErrorMessage(createProject.error, "Couldn't create the project.") : null}
            />
          </form>
        </Modal>
      )}

      {viewing && <ProjectMilestones project={viewing} onClose={() => setViewing(null)} />}

      {editing && (
        <Modal title={`Edit ${editing.name}`} eyebrow="Projects" onClose={() => setEditing(null)}>
          <form className="space-y-4" onSubmit={handleEdit}>
            <ProjectFields project={editing} />
            <FormActions
              onCancel={() => setEditing(null)}
              pending={updateProject.isPending}
              submitLabel="Save changes"
              error={updateProject.error ? apiErrorMessage(updateProject.error, "Couldn't save the project.") : null}
            />
          </form>
        </Modal>
      )}
    </main>
  );
}

// Matches CreateProjectDto / UpdateProjectDto: name (1–200), description
// (up to 10,000), start and due dates as YYYY-MM-DD (due not before start).
function ProjectFields({ project }: { project?: Project }) {
  return (
    <>
      <Field label="Project name">
        <input
          name="name"
          required
          maxLength={200}
          pattern=".*\S.*"
          defaultValue={project?.name}
          placeholder="Website redesign"
          className={inputClass}
        />
      </Field>
      <Field label="Description (optional)">
        <textarea
          name="description"
          rows={3}
          maxLength={10000}
          defaultValue={project?.description ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Start date (optional)">
          <input name="startDate" type="date" defaultValue={project?.startDate ?? ""} className={inputClass} />
        </Field>
        <Field label="Due date (optional)">
          <input name="dueDate" type="date" defaultValue={project?.dueDate ?? ""} className={inputClass} />
        </Field>
      </div>
    </>
  );
}
