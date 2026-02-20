"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Search, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ReceiptUpload } from "./ReceiptUpload";

interface TransactionFiltersProps {
  categories: { id: string; name: string; icon: string; type: string }[];
  currentType?: string;
  currentCategoryId?: string;
  showNewForm?: "income" | "expense";
}

interface ParsedReceipt {
  amount: number;
  description: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  confidence: number;
}

export function TransactionFilters({
  categories,
  currentType,
  showNewForm,
}: TransactionFiltersProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(!!showNewForm);
  const [showReceipt, setShowReceipt] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">(
    showNewForm === "income" ? "INCOME" : "EXPENSE"
  );
  const [loading, setLoading] = useState(false);
  const [aiPrefilled, setAiPrefilled] = useState(false);

  // Refs for pre-filling form
  const descRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const filteredCategories = categories.filter((c) => c.type === formType);

  const handleFilter = (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    router.push(`/dashboard/transactions?${params.toString()}`);
  };

  const handleReceiptParsed = (data: ParsedReceipt) => {
    // Switch to form mode with pre-filled data
    setShowReceipt(false);
    setShowForm(true);
    setFormType(data.type);
    setAiPrefilled(true);

    // Pre-fill form after a tick (to let the form render)
    setTimeout(() => {
      if (descRef.current) descRef.current.value = data.description;
      if (amountRef.current) amountRef.current.value = String(data.amount);
      if (dateRef.current) dateRef.current.value = data.date;
      if (categoryRef.current) categoryRef.current.value = data.categoryId;
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          amount: parseFloat(fd.get("amount") as string),
          description: fd.get("description") as string,
          notes: (fd.get("notes") as string) || undefined,
          date: fd.get("date") as string,
          categoryId: fd.get("categoryId") as string,
          isRecurring: fd.get("isRecurring") === "on",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Transacción creada");
      setShowForm(false);
      setAiPrefilled(false);
      router.refresh();
    } catch {
      toast.error("Error al crear la transacción");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/30 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {[
            { label: "Todas", value: undefined },
            { label: "Gastos", value: "EXPENSE" },
            { label: "Ingresos", value: "INCOME" },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => handleFilter(f.value)}
              className={
                currentType === f.value || (!currentType && !f.value)
                  ? "pill-active"
                  : "pill-inactive"
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar transacción..."
              className="pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary placeholder:text-text-muted w-52 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-colors"
            />
          </div>

          {/* Scan receipt button */}
          <button
            onClick={() => {
              setShowReceipt(!showReceipt);
              if (showReceipt) return;
              setShowForm(false);
            }}
            className={`flex items-center gap-2 ${showReceipt ? "btn-ghost" : "px-4 py-2.5 rounded-xl text-sm font-semibold border border-emerald-400/25 bg-emerald-500/[0.10] text-emerald-400 hover:bg-emerald-500/[0.15] transition-all cursor-pointer"}`}
          >
            {showReceipt ? (
              <X className="w-4 h-4" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {showReceipt ? "Cancelar" : "Escanear ticket"}
          </button>

          {/* New transaction button */}
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setAiPrefilled(false);
                return;
              }
              setShowReceipt(false);
            }}
            className={`flex items-center gap-2 ${showForm ? "btn-ghost" : "btn-primary"}`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Nueva transacción"}
          </button>
        </div>
      </div>

      {/* Receipt upload zone */}
      {showReceipt && (
        <ReceiptUpload
          onParsed={handleReceiptParsed}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-4 animate-fade-in-up"
        >
          {/* AI badge */}
          {aiPrefilled && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/[0.08] border border-emerald-400/[0.15]">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">
                Datos extraídos con IA — revisa y confirma antes de guardar
              </span>
            </div>
          )}

          {/* Type toggle */}
          <div className="flex gap-2">
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormType(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  formType === t
                    ? t === "EXPENSE"
                      ? "bg-red-500/[0.10] text-red-400 border-red-400/25"
                      : "bg-emerald-500/[0.10] text-emerald-400 border-emerald-400/25"
                    : "bg-white/[0.03] text-text-secondary border-white/[0.08] hover:bg-white/[0.05]"
                }`}
              >
                {t === "EXPENSE" ? "Gasto" : "Ingreso"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Descripción</label>
              <input ref={descRef} name="description" required placeholder="Ej: Compra supermercado" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Cantidad (€)</label>
              <input ref={amountRef} name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Categoría</label>
              <select ref={categoryRef} name="categoryId" required className={inputClass}>
                <option value="">Seleccionar...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Fecha</label>
              <input ref={dateRef} name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Notas (opcional)</label>
            <textarea name="notes" rows={2} placeholder="Notas adicionales..." className={`${inputClass} resize-none`} />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input name="isRecurring" type="checkbox" className="rounded bg-white/[0.04] border-white/[0.12]" />
              Recurrente
            </label>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Guardando..." : "Guardar transacción"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
