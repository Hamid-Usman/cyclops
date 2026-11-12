"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MilestoneInput, ProposalMilestone } from "@/services/types";
import { inputClass, smallButtonClass } from "../ui";

interface Row {
  key: number;
  title: string;
  deliverables: string;
  percent: string;
  dueDate: string;
}

let nextKey = 1;
const toRow = (milestone?: ProposalMilestone): Row => ({
  key: nextKey++,
  title: milestone?.title ?? "",
  deliverables: milestone?.deliverables ?? "",
  percent: milestone ? String(milestone.percent) : "",
  dueDate: milestone?.dueDate ?? "",
});

/** Reads the editor's hidden field back into the API shape. */
export function readMilestones(form: FormData): MilestoneInput[] {
  const raw = form.get("milestones");
  return typeof raw === "string" && raw ? (JSON.parse(raw) as MilestoneInput[]) : [];
}

/**
 * The payment schedule: milestones, each with deliverables and a share of the
 * total. With milestones, the deposit plus all milestones must make 100%.
 * Without any, whatever the deposit leaves is billed as one balance.
 */
export default function MilestonesEditor({ initial }: { initial?: ProposalMilestone[] }) {
  const [rows, setRows] = useState<Row[]>(() => (initial ?? []).map(toRow));
  const [deposit, setDeposit] = useState(0);
  const anchor = useRef<HTMLFieldSetElement>(null);

  // Follow the form's deposit field, to show the running total.
  useEffect(() => {
    const field = anchor.current?.closest("form")?.querySelector<HTMLInputElement>('[name="depositPercent"]');
    if (!field) return;
    const read = () => setDeposit(Number(field.value) || 0);
    read();
    field.addEventListener("input", read);
    return () => field.removeEventListener("input", read);
  }, []);

  const update = (key: number, field: keyof Omit<Row, "key">, value: string) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

  const milestones: MilestoneInput[] = rows.map((row) => ({
    title: row.title.trim(),
    deliverables: row.deliverables.trim() || null,
    percent: Number(row.percent) || 0,
    dueDate: row.dueDate || null,
  }));
  const total = Math.round((deposit + milestones.reduce((sum, m) => sum + m.percent, 0)) * 100) / 100;

  return (
    <fieldset ref={anchor} className="space-y-3 rounded-lg border border-border p-3">
      <legend className="px-1 text-sm font-medium text-foreground">Payment schedule</legend>
      <input type="hidden" name="milestones" value={JSON.stringify(milestones)} />
      <p className="text-xs text-muted-foreground">
        Optional. Add the milestones you&apos;ll bill for. When the client accepts, each one becomes a milestone on the
        project that you can invoice in one click.
      </p>

      {rows.map((row, index) => (
        <div key={row.key} className="space-y-2 rounded-lg bg-muted/40 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_6rem_9rem_auto]">
            <input
              aria-label={`Milestone ${index + 1} title`}
              required
              maxLength={200}
              pattern=".*\S.*"
              placeholder="e.g. Design approved"
              value={row.title}
              onChange={(event) => update(row.key, "title", event.target.value)}
              className={inputClass}
            />
            <input
              aria-label={`Milestone ${index + 1} share (%)`}
              type="number"
              required
              min={0.01}
              max={100}
              step={0.01}
              placeholder="%"
              value={row.percent}
              onChange={(event) => update(row.key, "percent", event.target.value)}
              className={inputClass}
            />
            <input
              aria-label={`Milestone ${index + 1} due date`}
              type="date"
              value={row.dueDate}
              onChange={(event) => update(row.key, "dueDate", event.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              aria-label={`Remove milestone ${index + 1}`}
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
              className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </div>
          <textarea
            aria-label={`Milestone ${index + 1} deliverables`}
            rows={2}
            maxLength={5000}
            placeholder="Deliverables for this milestone (optional)"
            value={row.deliverables}
            onChange={(event) => update(row.key, "deliverables", event.target.value)}
            className={inputClass}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={rows.length >= 20}
          onClick={() => setRows((current) => [...current, toRow()])}
          className={smallButtonClass}
        >
          <Plus aria-hidden="true" size={14} />
          Add milestone
        </button>
        {rows.length > 0 ? (
          <p className={`text-xs font-medium ${total === 100 ? "text-emerald-600" : "text-amber-600"}`}>
            Deposit {deposit}% + milestones = {total}%{total === 100 ? " ✓" : " (must be 100% to send)"}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {deposit > 0 ? `Deposit ${deposit}%, then the remaining ${100 - deposit}% as one balance.` : "Billed as one full payment."}
          </p>
        )}
      </div>
    </fieldset>
  );
}
