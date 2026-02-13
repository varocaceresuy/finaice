"use client";

import Link from "next/link";
import { Plus, TrendingUp } from "lucide-react";

interface QuickActionsProps {
  categories: { id: string; name: string; icon: string; type: string }[];
}

export function QuickActions({ categories }: QuickActionsProps) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold">Acciones rápidas</h3>
      </div>
      <div className="p-4 space-y-2.5">
        <Link
          href="/dashboard/transactions?new=expense"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/[0.06] text-red-400 border border-red-400/[0.12] hover:bg-red-500/[0.10] hover:border-red-400/[0.20] transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span className="text-sm font-medium">Añadir gasto</span>
        </Link>
        <Link
          href="/dashboard/transactions?new=income"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-emerald-500/[0.06] text-emerald-400 border border-emerald-400/[0.12] hover:bg-emerald-500/[0.10] hover:border-emerald-400/[0.20] transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span className="text-sm font-medium">Añadir ingreso</span>
        </Link>
        <Link
          href="/dashboard/investments"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-cyan-500/[0.06] text-cyan-400 border border-cyan-400/[0.12] hover:bg-cyan-500/[0.10] hover:border-cyan-400/[0.20] transition-all"
        >
          <TrendingUp className="w-4.5 h-4.5" />
          <span className="text-sm font-medium">Ver inversiones</span>
        </Link>
      </div>
    </div>
  );
}
