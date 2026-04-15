import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DentaSync — Consultorio",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Consultorio</h2>
        <p className="text-muted-foreground">Módulo: M04 Consultorio</p>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">Contenido en desarrollo</p>
      </div>
    </div>
  );
}
