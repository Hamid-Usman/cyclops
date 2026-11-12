"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "@/services/api";
import { loginWithGoogle, resolveHomePath } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

// The parts of Google Identity Services (https://accounts.google.com/gsi/client) used here.
interface GoogleIdentity {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }): void;
      renderButton(
        parent: HTMLElement,
        options: {
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "large" | "medium" | "small";
          text?: "signin_with" | "signup_with" | "continue_with" | "signin";
          shape?: "rectangular" | "pill" | "circle" | "square";
          logo_alignment?: "left" | "center";
          width?: number;
        },
      ): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Google's own "Continue with Google" button. Google returns an ID token, which
 * the backend's POST /auth/google exchanges for a Cyclops access token.
 */
export default function GoogleSignInButton({
  redirectTo,
}: {
  /** Defaults to the user's home: the client screen for clients, else the panel. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const container = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async ({ credential }: { credential: string }) => {
      setPending(true);
      setError(null);
      try {
        signIn(await loginWithGoogle(credential));
        router.push(redirectTo ?? (await resolveHomePath()));
      } catch (err) {
        setError(apiErrorMessage(err, "Google sign-in failed. Please try again."));
        setPending(false);
      }
    },
    [redirectTo, router, signIn],
  );

  useEffect(() => {
    const google = window.google;
    const element = container.current;
    if (!scriptReady || !google || !element || !CLIENT_ID) return;

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
    });
    element.replaceChildren();
    google.accounts.id.renderButton(element, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "center",
      // Google caps the button at 400px.
      width: Math.min(element.offsetWidth || 400, 400),
    });
  }, [scriptReady, handleCredential]);

  if (!CLIENT_ID) {
    return (
      <p className="rounded-xl border-2 border-dashed px-3 py-2 text-center text-xs text-slate-500">
        Google sign-in is off: set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        onReady={() => setScriptReady(true)}
      />
      <div
        ref={container}
        aria-busy={pending}
        className={`flex min-h-10 w-full justify-center ${pending ? "pointer-events-none opacity-50" : ""}`}
      />
      {pending && (
        <p className="text-center text-xs text-slate-500">Signing you in…</p>
      )}
      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
