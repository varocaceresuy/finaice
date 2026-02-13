"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowUpDown, Target, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Movimientos", href: "/dashboard/transactions", icon: ArrowUpDown },
  { name: "Presupuestos", href: "/dashboard/budgets", icon: Target },
  { name: "Inversiones", href: "/dashboard/investments", icon: TrendingUp },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-base)]/70 border-t border-emerald-400/[0.08] backdrop-blur-2xl">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                isActive ? "text-ft-accent" : "text-text-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
