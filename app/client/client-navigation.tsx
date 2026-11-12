"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  BriefcaseBusiness,
  FileText,
  Home,
  LogOut,
  Menu,
  ReceiptText,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

const navigationItems = [
  { label: "Overview", href: "/client", icon: Home },
  { label: "Proposals", href: "/client/proposals", icon: FileText },
  { label: "Invoices", href: "/client/invoices", icon: ReceiptText },
  { label: "Projects", href: "/client/projects", icon: BriefcaseBusiness },
];

const itemClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none";

export default function ClientNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  function handleSignOut() {
    signOut();
    router.replace("/auth/signin");
  }

  function renderItems(onNavigate?: () => void) {
    return (
      <>
        {navigationItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`${itemClass} ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon aria-hidden="true" size={18} />
                {label}
              </Link>
            </li>
          );
        })}
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-sidebar shadow-sm md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/client" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>
            Cyclops
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="client-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-primary/20"
          >
            {menuOpen ? <X color="#fff" aria-hidden="true" size={20} /> : <Menu color="#fff" aria-hidden="true" size={20} />}
          </button>
        </div>
        {menuOpen && (
          <nav id="client-mobile-navigation" aria-label="Client navigation" className="border-t border-border/70">
            <ul className="flex flex-col gap-1 px-4 py-3">
              {renderItems(() => setMenuOpen(false))}
              <li>
                <Link href="/panel" className={`${itemClass} text-sidebar-foreground hover:bg-sidebar-accent`}>
                  <ArrowLeftRight aria-hidden="true" size={18} />
                  Your workspace
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`${itemClass} w-full text-sidebar-foreground hover:bg-sidebar-accent`}
                >
                  <LogOut aria-hidden="true" size={18} />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <Link href="/client" className="flex items-center gap-3 px-2 text-lg font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            C
          </span>
          <span>
            Cyclops
            <span className="block text-xs font-normal text-sidebar-foreground/70">Client</span>
          </span>
        </Link>

        <div className="h-px bg-sidebar-border/50" />

        <nav aria-label="Client navigation">
          <ul className="flex flex-col gap-1">{renderItems()}</ul>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/panel"
            className="flex items-center gap-2 rounded-lg border border-sidebar-border/50 px-3 py-2 text-xs font-medium hover:bg-sidebar-accent"
            title="Run your own projects and invoices"
          >
            <ArrowLeftRight aria-hidden="true" size={14} />
            Switch to your workspace
          </Link>
          <div className="flex items-center justify-between gap-2 px-2">
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
        </div>
      </aside>
    </>
  );
}
