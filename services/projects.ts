import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { CreateProjectInput, Project, ProjectMilestone, UpdateProjectInput } from "./types";

export const projectKeys = {
  all: ["projects"] as const,
  milestones: (id: string) => ["projects", id, "milestones"] as const,
};

/** GET /projects/:id/milestones — the payment schedule from the accepted proposal. */
export function useProjectMilestonesQuery(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.milestones(projectId ?? ""),
    queryFn: async () =>
      (await api.get<ProjectMilestone[]>(`/projects/${projectId}/milestones`)).data,
    enabled: Boolean(projectId),
  });
}

/** PATCH /projects/:id/milestones/:milestoneId — mark delivered or undo. */
export function useUpdateMilestoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      completed,
    }: {
      projectId: string;
      milestoneId: string;
      completed: boolean;
    }) =>
      (
        await api.patch<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, {
          completed,
        })
      ).data,
    onSuccess: (_data, { projectId }) =>
      queryClient.invalidateQueries({ queryKey: projectKeys.milestones(projectId) }),
  });
}

/** GET /projects */
export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async () => (await api.get<Project[]>("/projects")).data,
  });
}

/** POST /projects — always created inactive. */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) =>
      (await api.post<Project>("/projects", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** PATCH /projects/:id — edit, complete or cancel. */
export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProjectInput & { id: string }) =>
      (await api.patch<Project>(`/projects/${id}`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
