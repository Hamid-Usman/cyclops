import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { CreateInvoiceInput, Invoice } from "./types";

export const invoiceKeys = { all: ["invoices"] as const };

/** GET /invoices */
export function useInvoicesQuery() {
  return useQuery({
    queryKey: invoiceKeys.all,
    queryFn: async () => (await api.get<Invoice[]>("/invoices")).data,
  });
}

function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };
}

/** POST /invoices — a draft for an active or completed project. */
export function useCreateInvoiceMutation() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) =>
      (await api.post<Invoice>("/invoices", input)).data,
    onSuccess: invalidate,
  });
}

/** POST /invoices/from-milestone — drafts the invoice for a deposit or milestone. */
export function useCreateInvoiceFromMilestoneMutation() {
  const invalidate = useInvalidateInvoices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ milestoneId }: { milestoneId: string; projectId: string }) =>
      (await api.post<Invoice>("/invoices/from-milestone", { milestoneId })).data,
    onSuccess: (_data, { projectId }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
    },
  });
}

/** DELETE /invoices/:id — drafts only. */
export function useDeleteInvoiceMutation() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: invalidate,
  });
}

/** POST /invoices/:id/send | mark-paid | void */
export function useInvoiceActionMutation() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      paidAt,
    }: {
      id: string;
      action: "send" | "mark-paid" | "void";
      paidAt?: string;
    }) =>
      (
        await api.post<Invoice>(
          `/invoices/${id}/${action}`,
          action === "mark-paid" && paidAt ? { paidAt } : {},
        )
      ).data,
    onSuccess: invalidate,
  });
}
