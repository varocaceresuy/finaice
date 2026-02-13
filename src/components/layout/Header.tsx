"use client";

import { Bell, Command } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/[0.06] bg-[var(--bg-deep)]/50 backdrop-blur-2xl flex items-center justify-between px-4 md:px-7 sticky top-0 z-40 shadow-[0_1px_24px_rgba(0,0,0,0.2)]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <select className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm font-medium cursor-pointer hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-text-primary transition-all outline-none appearance-none">
          <option>Este mes</option>
          <option>Últimos 3 meses</option>
          <option>Últimos 6 meses</option>
          <option>Este año</option>
        </select>
        <button className="btn-icon">
          <Bell className="w-4 h-4" />
        </button>
        <button className="btn-icon">
          <Command className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
