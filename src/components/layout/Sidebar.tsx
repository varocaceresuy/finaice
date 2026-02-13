"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpDown,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const navSections = [
  {
    label: "Principal",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Transacciones", href: "/dashboard/transactions", icon: ArrowUpDown },
      { name: "Presupuestos", href: "/dashboard/budgets", icon: Target },
    ],
  },
  {
    label: "Inversiones",
    items: [
      { name: "Portfolio", href: "/dashboard/investments", icon: TrendingUp },
    ],
  },
  {
    label: "Análisis",
    items: [
      { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
      { name: "Ajustes", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  user: { name?: string | null; email: string; avatarUrl?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-[var(--bg-base)]/80 backdrop-blur-2xl border-r border-emerald-400/[0.08] transition-all duration-300 relative flex-shrink-0 overflow-visible",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Accent glow line on right edge */}
      <div className="absolute top-0 right-0 w-px h-1/2 bg-gradient-to-b from-emerald-400/30 to-transparent" />
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-r-sm" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-emerald-400/[0.08]">
        <img
          src="/finai-logo.svg"
          alt="FinAI"
          className="w-10 h-10 shrink-0"
        />
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            FinAI
          </span>
        )}
      </div>

      {/* Floating collapse tab — sobresale del borde derecho */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 -right-3.5 z-50 w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-emerald-400/[0.15] text-text-muted flex items-center justify-center hover:bg-emerald-400/[0.08] hover:text-emerald-300 hover:border-emerald-400/[0.3] shadow-[0_2px_12px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-[1.2px] text-text-muted px-2.5 pt-4 pb-1.5">
                {section.label}
              </p>
            )}
            {collapsed && <div className="h-3" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all relative",
                      isActive
                        ? "bg-emerald-400/[0.08] text-emerald-400"
                        : "text-text-secondary hover:bg-hover hover:text-text-primary"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-emerald-400 rounded-r-full" />
                    )}
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "opacity-100" : "opacity-60")} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-emerald-400/[0.08] p-3.5 bg-emerald-400/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-semibold shrink-0">
            {user.name?.[0] || user.email[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{user.name || "Usuario"}</p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-text-muted hover:text-ft-red hover:bg-ft-red-soft transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
