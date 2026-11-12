import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  AcceptProposalInput,
  CreateProposalInput,
  Proposal,
  ProposalFieldsInput,
  ProposalSummary,
} from "./types";

export const proposalKeys = {
  all: ["proposals"] as const,
  one: (id: string) => ["proposals", id] as const,
  received: ["received-proposals"] as const,
  receivedOne: (id: string) => ["received-proposals", id] as const,
};

// --- Owner side: /proposals -------------------------------------------------

export function useProposalsQuery() {
  return useQuery({
    queryKey: proposalKeys.all,
    queryFn: async () => (await api.get<ProposalSummary[]>("/proposals")).data,
  });
}

export function useProposalQuery(id: string | null) {
  return useQuery({
    queryKey: proposalKeys.one(id ?? ""),
    queryFn: async () => (await api.get<Proposal>(`/proposals/${id}`)).data,
    enabled: Boolean(id),
  });
}

function useInvalidateProposals() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: proposalKeys.all });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useCreateProposalMutation() {
  const invalidate = useInvalidateProposals();
  return useMutation({
    mutationFn: async (input: CreateProposalInput) =>
      (await api.post<Proposal>("/proposals", input)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateProposalMutation() {
  const invalidate = useInvalidateProposals();
  return useMutation({
    mutationFn: async ({ id, ...input }: ProposalFieldsInput & { id: string }) =>
      (await api.patch<Proposal>(`/proposals/${id}`, input)).data,
    onSuccess: invalidate,
  });
}

export function useDeleteProposalMutation() {
  const invalidate = useInvalidateProposals();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/proposals/${id}`);
    },
    onSuccess: invalidate,
  });
}

/** POST /proposals/:id/send or /withdraw */
export function useProposalActionMutation() {
  const invalidate = useInvalidateProposals();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "send" | "withdraw" }) =>
      (await api.post<Proposal>(`/proposals/${id}/${action}`)).data,
    onSuccess: invalidate,
  });
}

// --- Client side: /received-proposals ---------------------------------------

export function useReceivedProposalsQuery(enabled = true) {
  return useQuery({
    queryKey: proposalKeys.received,
    queryFn: async () =>
      (await api.get<ProposalSummary[]>("/received-proposals")).data,
    enabled,
    retry: false,
  });
}

/** Opening a sent proposal marks it as viewed. */
export function useReceivedProposalQuery(id: string | null) {
  return useQuery({
    queryKey: proposalKeys.receivedOne(id ?? ""),
    queryFn: async () =>
      (await api.get<Proposal>(`/received-proposals/${id}`)).data,
    enabled: Boolean(id),
  });
}

export function useRespondToProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      args:
        | { id: string; action: "accept"; input: AcceptProposalInput }
        | { id: string; action: "decline"; input: { reason?: string | null } },
    ) =>
      (await api.post<Proposal>(`/received-proposals/${args.id}/${args.action}`, args.input))
        .data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.received });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["client-portal"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
