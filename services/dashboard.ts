import type { DashboardData } from "@/stores/dashboard-store";
import { api } from "./api";
import { useQuery } from "@tanstack/react-query";
import type { Attention } from "./types";

async function getDashboardSummary(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>("/dashboard");
    return data;
}

export function useGetDashboardQuery() {
    return useQuery({
        queryKey: ["dashboard", "summary"],
        queryFn: getDashboardSummary,
    });
}

/** GET /dashboard/attention — overdue or due within `days` (1–365). */
export function useAttentionQuery(days = 14) {
    return useQuery({
        queryKey: ["dashboard", "attention", days],
        queryFn: async () =>
            (await api.get<Attention>("/dashboard/attention", { params: { days } })).data,
    });
}