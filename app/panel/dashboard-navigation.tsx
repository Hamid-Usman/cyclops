"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ArrowLeftRight,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useMyClientQuery } from "@/services/clients";
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";

const navigationItems = [
  { label: "Dashboard", href: "/panel", icon: LayoutDashboard },
  { label: "Clients", href: "/panel/clients", icon: Users },
  { label: "Projects", href: "/panel/projects", icon: BriefcaseBusiness },
  { label: "Proposals", href: "/panel/proposals", icon: FileText },
  { label: "Invoices", href: "/panel/invoices", icon: ReceiptText },
];

export default function DashboardNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  // Users who are also someone's client can switch to the client screen.
  const isClient = Boolean(useMyClientQuery().data);

  function handleSignOut() {
    signOut();
    router.replace("/auth/signin");
  }

  function renderNavigationItems(onNavigate?: () => void) {
    return navigationItems.map(({ label, href, icon: Icon }) => {
      if (!href) {
        return (
          <li key={label}>
            <span
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/50"
              title={`${label} is coming soon`}
            >
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
              <span className="ml-auto text-xs">Soon</span>
            </span>
          </li>
        );
      }

      const active = pathname === href;

      return (
        <li key={label}>
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Icon aria-hidden="true" size={18} />
            <span>{label}</span>
            <ChevronRight
              aria-hidden="true"
              size={16}
              className={`ml-auto transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>
        </li>
      );
    });
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-sidebar shadow-sm backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/panel"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              <Image alt="" src={require('../../public/icon.png')} width={25} height={25} />
            </span>
            <span className="text-white">Cyclops</span>
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            {menuOpen ? (
              <X color="#fff" aria-hidden="true" size={20} />
            ) : (
              <Menu color="#fff" aria-hidden="true" size={20} />
            )}
          </button>
        </div>
        <div
          id="mobile-navigation"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={`overflow-hidden border-t border-border/70 bg-sidebar transition-[max-height,opacity] duration-200 ease-out motion-reduce:transition-none ${
            menuOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav aria-label="Mobile dashboard navigation">
            <ul className="flex flex-col gap-1 px-4 py-3">
              {renderNavigationItems(() => setMenuOpen(false))}
              {isClient && (
                <li>
                  <Link
                    href="/client"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <ArrowLeftRight aria-hidden="true" size={18} />
                    <span>Client view</span>
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogOut aria-hidden="true" size={18} />
                  <span>Sign out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <Link
          href="/panel"
          aria-label="Cyclops dashboard"
          className="flex items-center gap-3 px-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            
              <Image alt="" src={require('../../public/icon.png')} width={25} height={25} />
          </span>
          <span>Cyclops</span>
        </Link>

        <div className="h-px bg-sidebar-border/50" />

        <nav aria-label="Dashboard navigation">
          <ul className="flex flex-col gap-1">{renderNavigationItems()}</ul>
        </nav>

          <Link
            href="/client"
            className="mt-auto flex items-center gap-2 rounded-lg border border-sidebar-border/50 px-3 py-2 text-xs font-medium hover:bg-sidebar-accent"
          >
            <ArrowLeftRight aria-hidden="true" size={14} />
            Switch to client view
          </Link>

        <div className={`${isClient ? "" : "mt-auto "}flex items-center justify-between gap-2 px-2`}>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.displayName}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-sidebar-accent"
          >
            <LogOut aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="rounded-xl border border-sidebar-border/50 bg-sidebar-accent p-4">
          <p className="text-sm font-semibold">Free plan</p>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-sidebar-border/50"
            role="progressbar"
            aria-label="Free plan usage"
            aria-valuemin={0}
            aria-valuemax={30}
            aria-valuenow={14}
          >
            <div className="h-full w-[47%] rounded-full bg-sidebar-primary" />
          </div>
          <p className="mt-2 text-xs text-sidebar-foreground/70">Day 14 of 30 days</p>
        </div>
      </aside>
    </>
  );
}
