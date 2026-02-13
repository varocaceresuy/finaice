"use client";

import { formatCurrency, formatPercent } from "@/lib/utils";

interface OverviewCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

const cards = [
  {
    key: "income" as const,
    label: "Ingresos",
    icon: "📈",
    bg: "from-emerald-500/[0.02] via-emerald-400/[0.01]",
    borderGradient: "from-emerald-400/60 via-emerald-400/15 to-emerald-400/25",
    neonShadow: "shadow-[0_0_15px_rgba(52,211,153,0.08),inset_0_0_15px_rgba(52,211,153,0.03)]",
    hoverNeon: "hover:shadow-[0_0_25px_rgba(52,211,153,0.15),0_8px_40px_rgba(52,211,153,0.10),inset_0_0_20px_rgba(52,211,153,0.05)]",
    iconBg: "bg-emerald-400/[0.10]",
    valueColor: "text-emerald-400",
  },
  {
    key: "expenses" as const,
    label: "Gastos",
    icon: "📉",
    bg: "from-red-500/[0.02] via-red-400/[0.01]",
    borderGradient: "from-red-400/60 via-red-400/15 to-red-400/25",
    neonShadow: "shadow-[0_0_15px_rgba(248,113,113,0.06),inset_0_0_15px_rgba(248,113,113,0.02)]",
    hoverNeon: "hover:shadow-[0_0_25px_rgba(248,113,113,0.12),0_8px_40px_rgba(248,113,113,0.08),inset_0_0_20px_rgba(248,113,113,0.04)]",
    iconBg: "bg-red-400/[0.10]",
    valueColor: "text-red-400",
  },
  {
    key: "balance" as const,
    label: "Balance",
    icon: "💎",
    bg: "from-cyan-500/[0.02] via-cyan-400/[0.01]",
    borderGradient: "from-cyan-400/60 via-cyan-400/15 to-cyan-400/25",
    neonShadow: "shadow-[0_0_15px_rgba(34,211,238,0.06),inset_0_0_15px_rgba(34,211,238,0.02)]",
    hoverNeon: "hover:shadow-[0_0_25px_rgba(34,211,238,0.12),0_8px_40px_rgba(34,211,238,0.08),inset_0_0_20px_rgba(34,211,238,0.04)]",
    iconBg: "bg-cyan-400/[0.10]",
    valueColor: "text-cyan-400",
  },
  {
    key: "savings" as const,
    label: "Tasa de ahorro",
    icon: "🎯",
    bg: "from-amber-500/[0.02] via-amber-400/[0.01]",
    borderGradient: "from-amber-400/60 via-amber-400/15 to-amber-400/25",
    neonShadow: "shadow-[0_0_15px_rgba(251,191,36,0.06),inset_0_0_15px_rgba(251,191,36,0.02)]",
    hoverNeon: "hover:shadow-[0_0_25px_rgba(251,191,36,0.12),0_8px_40px_rgba(251,191,36,0.08),inset_0_0_20px_rgba(251,191,36,0.04)]",
    iconBg: "bg-amber-400/[0.10]",
    valueColor: "text-amber-400",
  },
];

export function OverviewCards({
  totalIncome,
  totalExpenses,
  balance,
  savingsRate,
}: OverviewCardsProps) {
  const values = {
    income: formatCurrency(totalIncome),
    expenses: formatCurrency(totalExpenses),
    balance: formatCurrency(balance),
    savings: formatPercent(savingsRate),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        /* Wrapper: borde gradiente neon top→bottom */
        <div
          key={card.key}
          className={`animate-fade-in-up delay-${i + 1} rounded-2xl p-px bg-gradient-to-b ${card.borderGradient} ${card.neonShadow} ${card.hoverNeon} hover:-translate-y-0.5 transition-all duration-300`}
        >
          {/* Card interior */}
          <div
            className={`bg-gradient-to-br ${card.bg} to-transparent bg-[var(--bg-base)] backdrop-blur-xl rounded-[15px] p-5 h-full relative overflow-hidden`}
          >
            <div className="relative flex items-center gap-2.5 mb-3.5">
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center text-lg backdrop-blur-sm`}>
                {card.icon}
              </div>
              <span className="text-sm text-white/60 font-medium">{card.label}</span>
            </div>
            <p className={`relative text-2xl font-bold tracking-tight font-mono-nums ${card.valueColor}`}>
              {values[card.key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
