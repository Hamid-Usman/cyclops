"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ChevronRight,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", icon: Users },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Invoices", icon: ReceiptText },
];

export default function DashboardNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              C
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
            menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav aria-label="Mobile dashboard navigation">
            <ul className="flex flex-col gap-1 px-4 py-3">
              {renderNavigationItems(() => setMenuOpen(false))}
            </ul>
          </nav>
        </div>
      </header>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <Link
          href="/dashboard"
          aria-label="Cyclops dashboard"
          className="flex items-center gap-3 px-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            C
          </span>
          <span>Cyclops</span>
        </Link>

        <div className="h-px bg-sidebar-border/50" />

        <nav aria-label="Dashboard navigation">
          <ul className="flex flex-col gap-1">{renderNavigationItems()}</ul>
        </nav>

        <div className="mt-auto rounded-xl border border-sidebar-border/50 bg-sidebar-accent p-4">
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
