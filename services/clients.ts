import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Client, ClientOverview, ClientStatus, CreateClientInput, Invoice } from "./types";

export const clientKeys = {
  all: ["clients"] as const,
  overview: ["client-portal"] as const,
  me: ["client-me"] as const,
};

/** GET /client/me — the signed-in user's client record; 404 if they aren't one. */
export function useMyClientQuery() {
  return useQuery({
    queryKey: clientKeys.me,
    queryFn: async () => (await api.get<Client>("/client/me")).data,
    retry: false,
    staleTime: 60_000,
  });
}

/** GET /client/me/overview — the signed-in user's own client portal. */
export function useClientOverviewQuery() {
  return useQuery({
    queryKey: clientKeys.overview,
    queryFn: async () => (await api.get<ClientOverview>("/client/me/overview")).data,
    retry: false,
  });
}

/** POST /client/me/invoices/:id/report-payment — the client says they paid. */
export function useReportPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reference }: { id: string; reference: string | null }) =>
      (await api.post<Invoice>(`/client/me/invoices/${id}/report-payment`, { reference })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.overview }),
  });
}

/** GET /client */
export function useClientsQuery() {
  return useQuery({
    queryKey: clientKeys.all,
    queryFn: async () => (await api.get<Client[]>("/client")).data,
  });
}

/** POST /client — adds an existing user (by email or id) as a client. */
export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateClientInput) =>
      (await api.post<Client>("/client", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

/** PATCH /client/:id */
export function useUpdateClientStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ClientStatus }) =>
      (await api.patch<Client>(`/client/${id}`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** DELETE /client/:id */
export function useDeleteClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/client/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
}
