"use client";

import { CheckCircle2, Printer } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/services/api";
import { useReceivedProposalQuery, useRespondToProposalMutation } from "@/services/proposals";
import { useAuthStore } from "@/stores/auth-store";
import ProposalDetails from "../panel/proposals/proposal-details";
import { Field, formatDate, formatMoney, FormActions, inputClass, Modal, orNull } from "../panel/ui";

type Mode = "view" | "accept" | "decline";

/**
 * Opens a proposal sent to the client (which marks it viewed) and lets them
 * accept it with a signature or decline it with a reason.
 */
export default function ProposalModal({ id, onClose }: { id: string; onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const opened = useReceivedProposalQuery(id);
  const respond = useRespondToProposalMutation();
  const [mode, setMode] = useState<Mode>("view");
  const [justAnswered, setJustAnswered] = useState<"accepted" | "declined" | null>(null);

  const proposal = opened.data;
  const canRespond = proposal && (proposal.status === "sent" || proposal.status === "viewed");

  async function handleAccept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await respond.mutateAsync({
        id,
        action: "accept",
        input: {
          agreeToTerms: form.get("agreeToTerms") === "on",
          signatureName: String(form.get("signatureName")).trim(),
        },
      });
      await opened.refetch();
      setJustAnswered("accepted");
      setMode("view");
    } catch {
      // Shown from respond.error.
    }
  }

  async function handleDecline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await respond.mutateAsync({ id, action: "decline", input: { reason: orNull(form.get("reason")) } });
      await opened.refetch();
      setJustAnswered("declined");
      setMode("view");
    } catch {
      // Shown from respond.error.
    }
  }

  return (
    <Modal title={proposal?.title ?? "Proposal"} eyebrow="Proposal" onClose={onClose} wide>
      {!proposal ? (
        <p className="text-sm text-muted-foreground">
          {opened.error ? apiErrorMessage(opened.error, "Couldn't open the proposal.") : "Loading…"}
        </p>
      ) : mode === "accept" ? (
        <form className="space-y-4" onSubmit={handleAccept}>
          <p className="text-sm text-muted-foreground">
            Accepting starts the project for{" "}
            <strong className="text-foreground">
              {formatMoney(proposal.totals?.total ?? proposal.total, proposal.currency)}
            </strong>
            {proposal.totals && proposal.totals.deposit > 0 && (
              <>
                , with a deposit of{" "}
                <strong className="text-foreground">{formatMoney(proposal.totals.deposit, proposal.currency)}</strong>{" "}
                invoiced to you right away
              </>
            )}
            .
          </p>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">
            {proposal.terms}
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input name="agreeToTerms" type="checkbox" required className="mt-1" />
            <span>I have read and agree to these terms.</span>
          </label>
          <Field label="Sign with your full name" hint="Your typed name is recorded as your signature.">
            <input
              name="signatureName"
              required
              maxLength={120}
              pattern=".*\S.*"
              defaultValue={user?.displayName ?? ""}
              className={inputClass}
            />
          </Field>
          <FormActions
            onCancel={() => setMode("view")}
            pending={respond.isPending}
            submitLabel="Accept and sign"
            error={respond.error ? apiErrorMessage(respond.error, "Couldn't accept the proposal.") : null}
          />
        </form>
      ) : mode === "decline" ? (
        <form className="space-y-4" onSubmit={handleDecline}>
          <Field label="Reason (optional)" hint="Shared with the person who sent it.">
            <textarea name="reason" rows={4} maxLength={5000} className={inputClass} />
          </Field>
          <FormActions
            onCancel={() => setMode("view")}
            pending={respond.isPending}
            submitLabel="Decline proposal"
            error={respond.error ? apiErrorMessage(respond.error, "Couldn't decline the proposal.") : null}
          />
        </form>
      ) : (
        <>
          {justAnswered === "accepted" && (
            <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700">
              <CheckCircle2 aria-hidden="true" size={18} />
              Accepted. The project is now active
              {proposal.paymentSchedule.some((step) => step.kind === "deposit")
                ? ", and your deposit invoice is ready under Invoices."
                : ". Invoices will arrive as the work progresses."}
            </p>
          )}
          {justAnswered === "declined" && (
            <p role="status" className="mb-4 rounded-lg bg-muted p-3 text-sm">
              Declined. The sender has been told.
            </p>
          )}
          {canRespond && proposal.validUntil && (
            <p className="mb-4 text-sm text-muted-foreground">
              You can answer until {formatDate(proposal.validUntil)}.
            </p>
          )}
          <ProposalDetails proposal={proposal} />
          <div className="mt-6 flex flex-wrap justify-end gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="mr-auto inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Printer aria-hidden="true" size={16} />
              Print
            </button>
            {canRespond && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    respond.reset();
                    setMode("decline");
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    respond.reset();
                    setMode("accept");
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Accept
                </button>
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
