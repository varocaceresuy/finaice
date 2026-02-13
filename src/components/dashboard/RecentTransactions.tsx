"use client";

import Link from "next/link";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    category: { name: string; icon: string; color: string };
  }[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-400/[0.04] to-transparent backdrop-blur-xl border border-emerald-400/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-400/[0.06]">
        <h3 className="text-sm font-semibold">Últimas transacciones</h3>
        <Link
          href="/dashboard/transactions"
          className="text-xs text-ft-accent hover:opacity-80 font-medium transition-opacity"
        >
          Ver todas →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-text-secondary text-sm">No hay transacciones aún.</p>
          <p className="text-text-muted text-xs mt-1">Añade tu primera transacción para empezar.</p>
        </div>
      ) : (
        <div>
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <div
                className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${t.category.color}12` }}
              >
                {t.category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium truncate">{t.description}</p>
                <p className="text-[11.5px] text-text-muted mt-0.5">
                  {t.category.name} · {formatDateShort(t.date)}
                </p>
              </div>
              <span
                className={`text-sm font-semibold font-[family-name:var(--font-mono)] tracking-tight ${
                  t.type === "INCOME" ? "text-ft-green" : t.type === "EXPENSE" ? "text-ft-red" : "text-text-secondary"
                }`}
              >
                {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
