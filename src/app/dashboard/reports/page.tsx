import { Header } from "@/components/layout/Header";

export default function ReportsPage() {
  return (
    <>
      <Header title="Reportes" subtitle="Análisis y comparativas" />
      <div className="p-4 md:p-7">
        <div className="bg-surface border border-[var(--border-default)] rounded-xl p-14 text-center animate-fade-in-up">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-lg font-semibold">Reportes y Visualizaciones</p>
          <p className="text-sm text-text-muted mt-1.5 max-w-sm mx-auto">
            Próximamente: gráficos interactivos con selector de tipo, comparativas mensuales, tendencias de 6-12 meses.
          </p>
        </div>
      </div>
    </>
  );
}
