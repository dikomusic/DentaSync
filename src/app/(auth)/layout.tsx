import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "DentaSync — Acceso",
  description: "Inicia sesión en tu consultorio DentaSync",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header mínimo con logo */}
      <header className="flex h-16 items-center px-8">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">DentaSync</span>
        </div>
      </header>

      {/* Contenido centrado */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
