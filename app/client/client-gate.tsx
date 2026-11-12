"use client";

import axios from "axios";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMyClientQuery } from "@/services/clients";

// Shows the client screen only to users who are someone's client.
export default function ClientGate({ children }: { children: ReactNode }) {
  const me = useMyClientQuery();
  const notAClient = axios.isAxiosError(me.error) && me.error.response?.status === 404;

  if (notAClient) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No client account yet</h1>
        <p className="text-sm text-muted-foreground">
          This screen is for clients. When someone you work with adds you as their client, your
          projects, proposals and invoices will appear here.
        </p>
        <Link
          href="/panel"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to your workspace
        </Link>
      </main>
    );
  }
  return children;
}
