"use client";

import { Archive, Trash2, UserCheck, UserPlus, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/services/api";
import {
  useClientsQuery,
  useCreateClientMutation,
  useDeleteClientMutation,
  useUpdateClientStatusMutation,
} from "@/services/clients";
import { CLIENT_STATUSES, type ClientStatus } from "@/services/types";
import {
  capitalize,
  Field,
  FormActions,
  inputClass,
  ListState,
  Modal,
  PageHeader,
  Panel,
  primaryButtonClass,
  smallButtonClass,
  StatCards,
  StatusBadge,
} from "../ui";

export default function Page() {
  const clients = useClientsQuery();
  const createClient = useCreateClientMutation();
  const updateStatus = useUpdateClientStatusMutation();
  const deleteClient = useDeleteClientMutation();
  const [adding, setAdding] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const list = clients.data ?? [];
  const count = (status: ClientStatus) => list.filter((client) => client.status === status).length;
  const loading = clients.isLoading ? "…" : null;

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createClient.mutateAsync({
        email: String(form.get("email")).trim(),
        status: String(form.get("status")) as ClientStatus,
      });
      setAdding(false);
    } catch {
      // Shown from createClient.error below.
    }
  }

  async function changeStatus(id: string, status: ClientStatus) {
    setRowError(null);
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (error) {
      setRowError(apiErrorMessage(error, "Couldn't change the status."));
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Remove ${name} as a client? This can't be undone.`)) return;
    setRowError(null);
    try {
      await deleteClient.mutateAsync(id);
    } catch (error) {
      setRowError(
        apiErrorMessage(error, "Couldn't remove this client. Clients with projects can't be removed."),
      );
    }
  }

  return (
    <main className="flex flex-col gap-8 pb-8">
      <PageHeader
        eyebrow="Clients"
        title="Client List"
        action={
          <button
            type="button"
            onClick={() => {
              createClient.reset();
              setAdding(true);
            }}
            className={primaryButtonClass}
          >
            <UserPlus aria-hidden="true" size={18} />
            Add client
          </button>
        }
      />

      <StatCards
        stats={[
          { label: "All clients", value: loading ?? list.length, detail: "Everyone in your directory", icon: Users },
          { label: "Active", value: loading ?? count("active"), detail: "Currently working with you", icon: UserCheck },
          { label: "Leads", value: loading ?? count("lead"), detail: "Not yet signed", icon: UserPlus },
          {
            label: "Inactive / archived",
            value: loading ?? count("inactive") + count("archived"),
            detail: "Paused or past clients",
            icon: Archive,
          },
        ]}
      />

      <Panel title="Client directory" description="Clients are people with a Cyclops account.">
        {rowError && (
          <p role="alert" className="px-5 pt-4 text-sm text-destructive">
            {rowError}
          </p>
        )}
        <ListState
          isLoading={clients.isLoading}
          error={clients.error ? apiErrorMessage(clients.error, "Couldn't load clients.") : null}
          isEmpty={list.length === 0}
          emptyText="No clients yet. Add one with the email they signed up with."
        />
        {list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Change status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {list.map((client) => (
                  <tr key={client.id} className="align-middle">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {client.user.displayName
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{client.user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{client.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        aria-label={`Status for ${client.user.displayName}`}
                        value={client.status}
                        disabled={updateStatus.isPending}
                        onChange={(event) => changeStatus(client.id, event.target.value as ClientStatus)}
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                      >
                        {CLIENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {capitalize(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => remove(client.id, client.user.displayName)}
                        disabled={deleteClient.isPending}
                        className={smallButtonClass}
                      >
                        <Trash2 aria-hidden="true" size={14} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {adding && (
        <Modal title="Add client" eyebrow="Clients" onClose={() => setAdding(false)}>
          <form className="space-y-4" onSubmit={handleAdd}>
            <Field label="Client's email" hint="They need a Cyclops account. Ask them to sign up first.">
              <input
                name="email"
                type="email"
                required
                maxLength={320}
                placeholder="client@example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue="active" className={inputClass}>
                {CLIENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {capitalize(status)}
                  </option>
                ))}
              </select>
            </Field>
            <FormActions
              onCancel={() => setAdding(false)}
              pending={createClient.isPending}
              submitLabel="Add client"
              error={createClient.error ? apiErrorMessage(createClient.error, "Couldn't add the client.") : null}
            />
          </form>
        </Modal>
      )}
    </main>
  );
}

