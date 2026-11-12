import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthGuard from "../panel/auth-guard";
import ClientGate from "./client-gate";
import ClientNavigation from "./client-navigation";

export const metadata: Metadata = {
  title: "Client | Cyclops",
  description: "Your projects, proposals and invoices from the people you work with.",
};

// The client screen: what a client sees of the work done for them.
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <ClientNavigation />
      <div className="mx-auto mt-4 flex w-full max-w-[1400px] min-w-0 flex-1 flex-col px-4 sm:px-6 lg:px-10">
        <AuthGuard>
          <ClientGate>{children}</ClientGate>
        </AuthGuard>
      </div>
    </div>
  );
}
