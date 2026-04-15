import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "DentaSync",
  description: "Plataforma de gestión odontológica",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sesion = await auth();

  return (
    <SessionProvider session={sesion}>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        {/* Sidebar fijo */}
        <Sidebar />

        {/* Contenido principal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      <Toaster />
    </SessionProvider>
  );
}
