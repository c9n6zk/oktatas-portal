"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MobileNavItem {
  href: string;
  label: string;
}

export interface MobileNavUser {
  name?: string | null;
  email?: string | null;
}

interface MobileNavProps {
  items: MobileNavItem[];
  user: MobileNavUser;
  themeToggle: React.ReactNode;
  logoutForm: React.ReactNode;
}

export function MobileNav({ items, user, themeToggle, logoutForm }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Menü megnyitása"
        aria-expanded={open}
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 z-50 max-h-dvh w-72 max-w-[85vw] bg-background text-foreground border-r border-b shadow-lg flex flex-col transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigációs menü"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b shrink-0">
          <span className="font-semibold">Menü</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menü bezárása"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col p-2 min-h-0 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t shrink-0">
          {(user.name || user.email) && (
            <div className="px-4 py-3 border-b">
              {user.name && (
                <div className="text-sm font-medium truncate">{user.name}</div>
              )}
              {user.email && (
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              )}
            </div>
          )}
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Téma:</span>
              {themeToggle}
            </div>
            {logoutForm}
          </div>
        </div>
      </aside>
    </>
  );
}
