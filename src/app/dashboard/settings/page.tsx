import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  return (
    <>
      <Header title="Ajustes" subtitle="Personaliza tu experiencia" />
      <div className="p-4 md:p-7">
        <div className="bg-surface border border-[var(--border-default)] rounded-xl p-14 text-center animate-fade-in-up">
          <p className="text-4xl mb-3">⚙️</p>
          <p className="text-lg font-semibold">Configuración</p>
          <p className="text-sm text-text-muted mt-1.5 max-w-sm mx-auto">
            Próximamente: gestión de categorías personalizadas, moneda, alertas y preferencias de visualización.
          </p>
        </div>
      </div>
    </>
  );
}
