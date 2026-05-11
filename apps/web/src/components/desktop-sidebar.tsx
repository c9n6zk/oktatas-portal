"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookOpen,
  Calendar,
  CalendarCog,
  CalendarDays,
  ChevronUp,
  ClipboardCheck,
  Contrast,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  MessageSquare,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Sun,
  UserCircle,
  Users,
  UsersRound,
  Vote,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  Users,
  School,
  BookOpen,
  ListChecks,
  MapPin,
  UsersRound,
  CalendarCog,
  Calendar,
  Vote,
  CalendarDays,
  UserCircle,
  MessageSquare,
};
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DesktopSidebarItem {
  href: string;
  label: string;
  icon: string;
}

interface DesktopSidebarProps {
  items: DesktopSidebarItem[];
  user: {
    name?: string | null;
    email?: string | null;
  };
  logoutAction: () => Promise<void> | void;
}

const STORAGE_KEY = "padtars-sidebar-collapsed";

function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function DesktopSidebar({ items, user, logoutAction }: DesktopSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, hydrated]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-dvh sticky top-0 border-r bg-background transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-3",
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <Logo size="sm" showText />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
          aria-label={collapsed ? "Menü kinyitása" : "Menü becsukása"}
          title={collapsed ? "Menü kinyitása" : "Menü becsukása"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const Icon = ICON_MAP[icon];
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md text-sm transition-colors h-9",
                collapsed ? "justify-center px-0" : "px-2.5",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground hover:bg-accent/60",
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2 shrink-0">
        <UserDropdown user={user} logoutAction={logoutAction} collapsed={collapsed} />
      </div>
    </aside>
  );
}

function UserDropdown({
  user,
  logoutAction,
  collapsed,
}: {
  user: { name?: string | null; email?: string | null };
  logoutAction: () => Promise<void> | void;
  collapsed: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const initials = getInitials(user.name, user.email);
  const displayName = user.name || user.email || "Felhasználó";

  const themeIcon =
    theme === "dark" ? <Moon className="h-4 w-4" /> :
    theme === "light" ? <Sun className="h-4 w-4" /> :
    theme === "high-contrast" ? <Contrast className="h-4 w-4" /> :
    <Monitor className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center",
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <span className="flex-1 min-w-0 text-sm font-medium truncate leading-tight">{displayName}</span>
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
        {user.email && (
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            Profilom
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {themeIcon}
            <span className="ml-2">Téma</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Világos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Sötét
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("high-contrast")}>
              <Contrast className="mr-2 h-4 w-4" />
              Magas kontraszt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              Rendszer
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <button
            type="submit"
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive hover:bg-accent hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Kijelentkezés
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
