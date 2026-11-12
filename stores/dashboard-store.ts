import { create } from "zustand";

export interface DashboardData {
  activeClients: number;
  activeProjects: number;
  pendingInvoices: {
    count: number;
    overdueCount: number;
    totals: {
      currency: string;
      amount: number;
    }[];
  };
  proposals: {
    total: number;
    drafts: number;
    awaitingResponse: number;
    accepted: number;
  };
}

interface DashboardState extends DashboardData {
  setDashboardData: (data: DashboardData) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  activeClients: 4,
  activeProjects: 2,
  pendingInvoices: {
    count: 3,
    overdueCount: 1,
    totals: [{ currency: "USD", amount: 2080.12 }],
  },
  proposals: { total: 0, drafts: 0, awaitingResponse: 0, accepted: 0 },
  setDashboardData: (data) => set(data),
}));