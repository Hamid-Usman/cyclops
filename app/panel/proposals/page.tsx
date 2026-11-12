"use client";

import { FilePlus2, FileText, Handshake, Pencil, Send, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { apiErrorMessage } from "@/services/api";
import { useClientsQuery } from "@/services/clients";
import { useProjectsQuery } from "@/services/projects";
import {
  useCreateProposalMutation,
  useDeleteProposalMutation,
  useProposalActionMutation,
  useProposalQuery,
  useProposalsQuery,
  useUpdateProposalMutation,
} from "@/services/proposals";
import {
  DURATION_UNITS,
  type DurationUnit,
  type Proposal,
  type ProposalFieldsInput,
  type ProposalSection,
  type ProposalSummary,
} from "@/services/types";
import {
  capitalize,
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
import MilestonesEditor, { readMilestones } from "./milestones-editor";
import ProposalDetails from "./proposal-details";

const SECTION_LABELS: Record<ProposalSection, string> = {
  problemStatement: "Problem",
  deliverables: "Deliverables",
  timeline: "Timeline",
  cost: "Cost",
  terms: "Terms",
};

// Reads the five sections + pricing from the form, in the shape of
// CreateProposalDto / UpdateProposalDto.
function readProposalFields(form: FormData): ProposalFieldsInput {
  const number = (name: string) => {
    const value = String(form.get(name) ?? "").trim();
    return value === "" ? null : Number(value);
  };
  const validUntil = orNull(form.get("validUntil"));
  return {
    title: String(form.get("title")).trim(),
    problemStatement: orNull(form.get("problemStatement")),
    deliverables: orNull(form.get("deliverables")),
    estimatedStartDate: orNull(form.get("estimatedStartDate")),
    estimatedDuration: number("estimatedDuration"),
    durationUnit: (orNull(form.get("durationUnit")) as DurationUnit | null) ?? null,
    price: number("price"),
    currency: String(form.get("currency")).trim().toUpperCase(),
    discount: number("discount") ?? 0,
    taxRate: number("taxRate") ?? 0,
    depositPercent: number("depositPercent") ?? 0,
    terms: orNull(form.get("terms")),
    // The date picker gives a local date; the proposal is valid through the end of that day.
    validUntil: validUntil ? new Date(`${validUntil}T23:59:59`).toISOString() : null,
    milestones: readMilestones(form),
  };
}

/** Send failures list the sections still empty. */
function sendErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const missing = error.response?.data?.missingSections as ProposalSection[] | undefined;
    if (missing?.length) {
      return `Fill in these sections before sending: ${missing.map((s) => SECTION_LABELS[s]).join(", ")}.`;
    }
  }
  return apiErrorMessage(error, "Couldn't send the proposal.");
}

export default function Page() {
  const proposals = useProposalsQuery();
  const projects = useProjectsQuery();
  const clients = useClientsQuery();
  const createProposal = useCreateProposalMutation();
  const updateProposal = useUpdateProposalMutation();
  const deleteProposal = useDeleteProposalMutation();
  const proposalAction = useProposalActionMutation();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const editing = useProposalQuery(editingId);
  const viewing = useProposalQuery(viewingId);

  const list = proposals.data ?? [];
  const inactiveProjects = (projects.data ?? []).filter((project) => project.status === "inactive");
  const projectName = (id: string | null) =>
    id === null
      ? "New project when accepted"
      : (projects.data?.find((project) => project.id === id)?.name ?? "—");
  const clientName = (id: string) =>
    clients.data?.find((client) => client.id === id)?.user.displayName ?? "—";
  const countIn = (...statuses: ProposalSummary["status"][]) =>
    list.filter((proposal) => statuses.includes(proposal.status)).length;
  const loading = proposals.isLoading ? "…" : null;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      // "client:<id>" creates the project on acceptance; "project:<id>" uses an existing one.
      const [kind, targetId] = String(form.get("target")).split(":");
      await createProposal.mutateAsync({
        ...readProposalFields(form),
        ...(kind === "project" ? { projectId: targetId } : { clientId: targetId }),
        title: String(form.get("title")).trim(),
      });
      setCreating(false);
    } catch {
      // Shown from createProposal.error.
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    try {
      await updateProposal.mutateAsync({ id: editingId, ...readProposalFields(new FormData(event.currentTarget)) });
      setEditingId(null);
    } catch {
      // Shown from updateProposal.error.
    }
  }

  async function act(proposal: ProposalSummary, action: "send" | "withdraw" | "delete") {
    const prompts = {
      send: `Send "${proposal.title}" to the client? The terms and totals are locked once sent.`,
      withdraw: `Withdraw "${proposal.title}"? The client will no longer be able to accept it.`,
      delete: `Delete the draft "${proposal.title}"?`,
    };
    if (!window.confirm(prompts[action])) return;
    setRowError(null);
    try {
      if (action === "delete") await deleteProposal.mutateAsync(proposal.id);
      else await proposalAction.mutateAsync({ id: proposal.id, action });
    } catch (error) {
      setRowError(action === "send" ? sendErrorMessage(error) : apiErrorMessage(error, "Couldn't update the proposal."));
    }
  }

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader
        eyebrow="Proposals"
        title="Proposal List"
        action={
          <button
            type="button"
            onClick={() => {
              createProposal.reset();
              setCreating(true);
            }}
            className={primaryButtonClass}
          >
            <FilePlus2 aria-hidden="true" size={18} />
            New proposal
          </button>
        }
      />

      <StatCards
        stats={[
          { label: "Drafts", value: loading ?? countIn("draft"), detail: "Still being written", icon: FileText },
          { label: "Awaiting reply", value: loading ?? countIn("sent", "viewed"), detail: "Sent to the client", icon: Send },
          { label: "Accepted", value: loading ?? countIn("accepted"), detail: "Turned into active projects", icon: Handshake },
          {
            label: "Closed",
            value: loading ?? countIn("declined", "expired", "withdrawn", "superseded"),
            detail: "Declined, expired, withdrawn or superseded",
            icon: Trash2,
          },
        ]}
      />

      <Panel
        title="Proposals"
        description="Write a proposal for an inactive project and send it. When the client accepts, the project becomes active."
      >
        {rowError && (
          <p role="alert" className="px-5 pt-4 text-sm text-destructive">
            {rowError}
          </p>
        )}
        <ListState
          isLoading={proposals.isLoading}
          error={proposals.error ? apiErrorMessage(proposals.error, "Couldn't load proposals.") : null}
          isEmpty={list.length === 0}
          emptyText="No proposals yet."
        />
        {list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Proposal</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Sent</th>
                  <th className="px-5 py-3 font-medium">Valid until</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {list.map((proposal) => (
                  <tr key={proposal.id} className="align-middle">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{proposal.title}</p>
                      <p className="text-xs text-muted-foreground">{projectName(proposal.projectId)}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{clientName(proposal.clientId)}</td>
                    <td className="px-5 py-4 tabular-nums">{formatMoney(proposal.total, proposal.currency)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(proposal.sentAt)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(proposal.validUntil)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" className={smallButtonClass} onClick={() => setViewingId(proposal.id)}>
                          Views
                        </button>
                        {proposal.status === "draft" && (
                          <>
                            <button
                              type="button"
                              className={smallButtonClass}
                              onClick={() => {
                                updateProposal.reset();
                                setEditingId(proposal.id);
                              }}
                            >
                              <Pencil aria-hidden="true" size={14} />
                              Edit
                            </button>
                            <button type="button" className={smallButtonClass} onClick={() => act(proposal, "send")}>
                              <Send aria-hidden="true" size={14} />
                              Send
                            </button>
                            <button type="button" className={smallButtonClass} onClick={() => act(proposal, "delete")}>
                              Delete
                            </button>
                          </>
                        )}
                        {(proposal.status === "sent" || proposal.status === "viewed") && (
                          <button type="button" className={smallButtonClass} onClick={() => act(proposal, "withdraw")}>
                            Withdraw
                          </button>
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
        <Modal title="New proposal" eyebrow="Proposals" onClose={() => setCreating(false)} wide>
          <form className="space-y-4" onSubmit={handleCreate}>
            <Field
              label="Who is it for?"
              hint="Pick a client and Cyclops creates the project, with its milestones, when they accept. Or attach it to an existing inactive project."
            >
              <select name="target" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Choose a client or project
                </option>
                <optgroup label="Client (project created on acceptance)">
                  {(clients.data ?? []).map((client) => (
                    <option key={client.id} value={`client:${client.id}`}>
                      {client.user.displayName} ({client.user.email})
                    </option>
                  ))}
                </optgroup>
                {inactiveProjects.length > 0 && (
                  <optgroup label="Existing inactive project">
                    {inactiveProjects.map((project) => (
                      <option key={project.id} value={`project:${project.id}`}>
                        {project.name} — {clientName(project.clientId)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </Field>
            <ProposalFields />
            <FormActions
              onCancel={() => setCreating(false)}
              pending={createProposal.isPending}
              submitLabel="Save draft"
              error={createProposal.error ? apiErrorMessage(createProposal.error, "Couldn't create the proposal.") : null}
            />
          </form>
        </Modal>
      )}

      {editingId && (
        <Modal title="Edit draft" eyebrow="Proposals" onClose={() => setEditingId(null)} wide>
          {editing.data ? (
            <form className="space-y-4" onSubmit={handleEdit}>
              <ProposalFields proposal={editing.data} />
              <FormActions
                onCancel={() => setEditingId(null)}
                pending={updateProposal.isPending}
                submitLabel="Save changes"
                error={updateProposal.error ? apiErrorMessage(updateProposal.error, "Couldn't save the proposal.") : null}
              />
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              {editing.error ? apiErrorMessage(editing.error, "Couldn't load the proposal.") : "Loading…"}
            </p>
          )}
        </Modal>
      )}

      {viewingId && (
        <Modal title={viewing.data?.title ?? "Proposal"} eyebrow="Proposal" onClose={() => setViewingId(null)} wide>
          {viewing.data ? (
            <ProposalDetails proposal={viewing.data} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {viewing.error ? apiErrorMessage(viewing.error, "Couldn't load the proposal.") : "Loading…"}
            </p>
          )}
        </Modal>
      )}
    </main>
  );
}

// The five sections the backend checks before sending, plus pricing.
function ProposalFields({ proposal }: { proposal?: Proposal }) {
  const validUntil = proposal?.validUntil ? new Date(proposal.validUntil) : null;
  const localDate = validUntil
    ? `${validUntil.getFullYear()}-${String(validUntil.getMonth() + 1).padStart(2, "0")}-${String(validUntil.getDate()).padStart(2, "0")}`
    : "";
  return (
    <>
      <Field label="Title">
        <input
          name="title"
          required
          maxLength={200}
          pattern=".*\S.*"
          defaultValue={proposal?.title}
          placeholder="Checkout redesign proposal"
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        A draft can be saved half-finished. Sections 1–5 must all be filled in to send it.
      </p>
      <Field label="1. What problem are you solving?">
        <textarea name="problemStatement" rows={3} maxLength={20000} defaultValue={proposal?.problemStatement ?? ""} className={inputClass} />
      </Field>
      <Field label="2. What exactly will you deliver?">
        <textarea name="deliverables" rows={3} maxLength={20000} defaultValue={proposal?.deliverables ?? ""} className={inputClass} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="3. Estimated start">
          <input name="estimatedStartDate" type="date" defaultValue={proposal?.estimatedStartDate ?? ""} className={inputClass} />
        </Field>
        <Field label="Duration">
          <input
            name="estimatedDuration"
            type="number"
            min={1}
            max={1000}
            step={1}
            defaultValue={proposal?.estimatedDuration ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Unit">
          <select name="durationUnit" defaultValue={proposal?.durationUnit ?? ""} className={inputClass}>
            <option value="">—</option>
            {DURATION_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {capitalize(unit)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Field label="4. Price">
          <input name="price" type="number" min={0} max={9999999999.99} step={0.01} defaultValue={proposal?.price ?? ""} className={inputClass} />
        </Field>
        <Field label="Currency">
          <input
            name="currency"
            required
            maxLength={3}
            pattern="[A-Za-z]{3}"
            defaultValue={proposal?.currency ?? "USD"}
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Discount">
          <input name="discount" type="number" min={0} max={9999999999.99} step={0.01} defaultValue={proposal?.discount ?? 0} className={inputClass} />
        </Field>
        <Field label="Tax %">
          <input name="taxRate" type="number" min={0} max={100} step={0.01} defaultValue={proposal?.taxRate ?? 0} className={inputClass} />
        </Field>
        <Field label="Deposit %">
          <input name="depositPercent" type="number" min={0} max={100} step={1} defaultValue={proposal?.depositPercent ?? 0} className={inputClass} />
        </Field>
      </div>
      <MilestonesEditor initial={proposal?.milestones} />
      <Field label="5. Terms the client must agree to">
        <textarea name="terms" rows={4} maxLength={50000} defaultValue={proposal?.terms ?? ""} className={inputClass} />
      </Field>
      <Field label="Valid until (optional)" hint="After this day the client can no longer accept.">
        <input name="validUntil" type="date" defaultValue={localDate} className={inputClass} />
      </Field>
    </>
  );
}
