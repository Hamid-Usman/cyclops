"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

// Whether the persisted session has been read from localStorage yet.
// Always false while rendering on the server.
function useAuthHydrated() {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}

// Sends signed-out visitors to the sign-in page. The page itself always
// renders (Next's instant-navigation check needs it to), and an opaque
// overlay covers it until a session is confirmed.
export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthHydrated();
  const signedIn = hydrated && Boolean(token);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/auth/signin");
    }
  }, [hydrated, token, router]);

  return (
    <>
      {children}
      {!signedIn && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        </div>
      )}
    </>
  );
}
