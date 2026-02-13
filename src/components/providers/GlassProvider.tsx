"use client";

import { ThemeProvider } from "shadcn-glass-ui";

export function GlassProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultTheme="glass">{children}</ThemeProvider>;
}
