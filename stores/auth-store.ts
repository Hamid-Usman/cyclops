import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  signIn: (response: AuthResponse) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      signIn: ({ accessToken, user }) => set({ accessToken, user }),
      signOut: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "cyclops-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
