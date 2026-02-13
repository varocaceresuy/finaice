"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Repeat } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface TransactionListProps {
  transactions: {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    notes: string | null;
    isRecurring: boolean;
    category: { id: string; name: string; icon: string; color: string };
  }[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta transacción?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Transacción eliminada");
      router.refresh();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-surface border border-[var(--border-default)] rounded-xl p-14 text-center">
        <p className="text-4xl mb-3">📝</p>
        <p className="text-text-secondary">No hay transacciones.</p>
        <p className="text-sm text-text-muted mt-1">
          Pulsa &quot;Nueva transacción&quot; para empezar.
        </p>
      </div>
    );
  }

  const grouped: Record<string, typeof transactions> = {};
  for (const t of transactions) {
    const key = formatDate(t.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="animate-fade-in-up">
          <div className="bg-surface border border-[var(--border-default)] rounded-xl overflow-hidden">
            <div className="px-5 py-2.5 border-b border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {date}
              </p>
            </div>
            {items.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-hover transition-colors group"
              >
                <div
                  className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${t.category.color}12` }}
                >
                  {t.category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-medium truncate">{t.description}</p>
                    {t.isRecurring && (
                      <Repeat className="w-3 h-3 text-text-muted shrink-0" />
                    )}
                  </div>
                  <p className="text-[11.5px] text-text-muted">{t.category.name}</p>
                </div>
                <span
                  className={`text-sm font-semibold font-[family-name:var(--font-mono)] tracking-tight ${
                    t.type === "INCOME" ? "text-ft-green" : t.type === "EXPENSE" ? "text-ft-red" : "text-text-secondary"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                </span>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="p-1.5 rounded-md text-text-muted opacity-0 group-hover:opacity-100 hover:text-ft-red hover:bg-ft-red-soft transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
