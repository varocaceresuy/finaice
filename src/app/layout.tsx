import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
// import 'shadcn-glass-ui/styles.css';
// import { GlassProvider } from "@/components/providers/GlassProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FinAI — Finanzas Personales",
  description: "Control de gastos, inversiones y presupuestos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${outfit.variable} ${jetbrains.variable} font-[family-name:var(--font-outfit)]`}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111c16",
                border: "1px solid rgba(52,211,153,0.10)",
                color: "#e8f0ec",
              },
            }}
          />
      </body>
    </html>
  );
}
