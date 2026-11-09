
import type { Metadata } from "next";
import { type ReactNode } from "react";
import { Geist_Mono } from "next/font/google";
import DashboardNavigation from "./dashboard-navigation";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Dashboard | Cyclops",
  description:
    "Manage clients, projects, proposals, invoices, and payments in one straightforward workspace built for freelancers and small agencies.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <DashboardNavigation />
      <div className="mx-auto mt-4 flex w-full max-w-[1600px] min-w-0 flex-1 flex-col px-4 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
}
