import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DentaSync — Tenants",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
        <p className="text-muted-foreground">Módulo: M02 Tenants</p>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">Contenido en desarrollo</p>
      </div>
    </div>
  );
}
