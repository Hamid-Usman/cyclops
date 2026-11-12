// Shapes returned by the Cyclops backend. Kept in sync with the backend's
// *.responses.ts / *.dto.ts files.

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
}

// --- Clients ---------------------------------------------------------------

export type ClientStatus = "lead" | "active" | "inactive" | "archived";
export const CLIENT_STATUSES: ClientStatus[] = ["lead", "active", "inactive", "archived"];

export interface Client {
  id: string;
  status: ClientStatus;
  user: PublicUser;
}

/** POST /client: an existing user, by email or id (one of them). */
export interface CreateClientInput {
  email?: string;
  userId?: string;
  status?: ClientStatus;
}

// --- Projects --------------------------------------------------------------

export type ProjectStatus = "inactive" | "active" | "completed" | "cancelled";
export const PROJECT_STATUSES: ProjectStatus[] = ["inactive", "active", "completed", "cancelled"];

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  /** From the accepted proposal. */
  deliverables: string | null;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** New projects are always inactive; there is no status field. */
export interface CreateProjectInput {
  clientId: string;
  name: string;
  description?: string | null;
  startDate?: string | null; // YYYY-MM-DD
  dueDate?: string | null; // YYYY-MM-DD
}

/** status: only completed or cancelled. Active comes from an accepted proposal. */
export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  status?: "completed" | "cancelled";
}

// --- Proposals -------------------------------------------------------------

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn"
  | "superseded";

export type DurationUnit = "days" | "weeks" | "months";
export const DURATION_UNITS: DurationUnit[] = ["days", "weeks", "months"];

export type ProposalSection = "problemStatement" | "deliverables" | "timeline" | "cost" | "terms";

export interface ProposalSummary {
  id: string;
  /** Null until accepted when the proposal was sent to a client without a project. */
  projectId: string | null;
  clientId: string;
  title: string;
  status: ProposalStatus;
  currency: string;
  total: number | null;
  validUntil: string | null;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalTotals {
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  deposit: number;
}

export interface Proposal extends ProposalSummary {
  problemStatement: string | null;
  deliverables: string | null;
  estimatedStartDate: string | null;
  estimatedDuration: number | null;
  durationUnit: DurationUnit | null;
  price: number | null;
  discount: number;
  taxRate: number;
  depositPercent: number;
  totals: ProposalTotals | null;
  terms: string | null;
  missingSections: ProposalSection[];
  viewedAt: string | null;
  acceptedByName: string | null;
  termsAcceptedAt: string | null;
  declineReason: string | null;
  milestones: ProposalMilestone[];
  /** What the client will be billed, in order; amounts null until the total is known. */
  paymentSchedule: PaymentStep[];
}

export type MilestoneKind = "deposit" | "milestone" | "balance";

export interface ProposalMilestone {
  id: string;
  title: string;
  deliverables: string | null;
  percent: number;
  dueDate: string | null;
}

export interface PaymentStep {
  kind: MilestoneKind;
  title: string;
  deliverables: string | null;
  percent: number;
  amount: number | null;
  dueDate: string | null;
}

export interface MilestoneInput {
  title: string;
  deliverables?: string | null;
  percent: number;
  dueDate?: string | null;
}

/** A billable step of a project, generated from its accepted proposal. */
export interface ProjectMilestone {
  id: string;
  projectId: string;
  kind: MilestoneKind;
  title: string;
  deliverables: string | null;
  percent: number;
  amount: number;
  currency: string;
  dueDate: string | null;
  completedAt: string | null;
  invoice: { id: string; number: string | null; status: InvoiceStatus; total: number } | null;
}

export interface ProposalFieldsInput {
  title?: string;
  problemStatement?: string | null;
  deliverables?: string | null;
  estimatedStartDate?: string | null; // YYYY-MM-DD
  estimatedDuration?: number | null; // whole number, 1+
  durationUnit?: DurationUnit | null;
  price?: number | null; // up to 2 decimals
  currency?: string; // 3 uppercase letters
  discount?: number;
  taxRate?: number; // percent 0-100, up to 2 decimals
  depositPercent?: number; // whole percent 0-100
  terms?: string | null;
  validUntil?: string | null; // ISO date-time
  /** Replaces the whole schedule when sent. */
  milestones?: MilestoneInput[];
}

/** For an existing inactive project, or for a client: accepting then creates the project. */
export interface CreateProposalInput extends ProposalFieldsInput {
  projectId?: string;
  clientId?: string;
  title: string;
}

export interface AcceptProposalInput {
  agreeToTerms: boolean;
  signatureName: string;
}

// --- Invoices --------------------------------------------------------------

export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string | null;
  projectId: string;
  clientId: string;
  title: string;
  description: string | null;
  notes: string | null;
  status: InvoiceStatus;
  isOverdue: boolean;
  currency: string;
  lineItems: InvoiceLineItem[];
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: string | null;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  voidedAt: string | null;
  /** When the client said they paid; the owner confirms with mark-paid. */
  paymentReportedAt: string | null;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  projectId: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  currency?: string;
  taxRate?: number;
  dueDate?: string | null; // YYYY-MM-DD
  lineItems: LineItemInput[];
}

// --- Dashboard -------------------------------------------------------------

export interface AttentionInvoice {
  id: string;
  number: string;
  title: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  currency: string;
  total: number;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

export interface AttentionProject {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

export interface Attention {
  days: number;
  invoices: AttentionInvoice[];
  projects: AttentionProject[];
}

// --- Client portal (GET /client/me/overview) --------------------------------

export interface ClientOverview {
  client: Client;
  summary: {
    activeProjects: number;
    proposalsAwaitingResponse: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    amountDue: { currency: string; amount: number }[];
  };
  projects: Project[];
  /** Sent to the client; drafts are never included. */
  proposals: ProposalSummary[];
  /** Sent to the client; drafts are never included. */
  invoices: Invoice[];
  /** Payment schedules of the client's projects. */
  milestones: ProjectMilestone[];
}
