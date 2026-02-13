import { Header } from "@/components/layout/Header";

export default function BudgetsPage() {
  return (
    <>
      <Header title="Presupuestos" subtitle="Control de gasto por categoría" />
      <div className="p-4 md:p-7">
        <div className="bg-surface border border-[var(--border-default)] rounded-xl p-14 text-center animate-fade-in-up">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-lg font-semibold">Presupuestos</p>
          <p className="text-sm text-text-muted mt-1.5 max-w-sm mx-auto">
            Próximamente: crea presupuestos por categoría con barras de progreso y alertas automáticas al 50%, 75%, 90% y 100%.
          </p>
        </div>
      </div>
    </>
  );
}
