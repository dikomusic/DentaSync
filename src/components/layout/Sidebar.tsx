"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Building2,
  CreditCard,
  ShoppingCart,
  ClipboardList,
  Wallet,
  Menu,
  X,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, ROLE_LABEL } from "@/types/roles.types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Navegación por rol
const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  [UserRole.SUPER_ADMIN]: [
    { label: "Tenants", href: "/super-admin/tenants", icon: Building2 },
    { label: "Suscripciones", href: "/super-admin/subscriptions", icon: CreditCard },
  ],
  [UserRole.DOCTOR_JEFE]: [
    { label: "Consultorio", href: "/jefe/consultorio", icon: LayoutDashboard },
    { label: "Agenda", href: "/jefe/agenda", icon: Calendar },
    { label: "Pacientes", href: "/jefe/pacientes", icon: Users },
    { label: "Historia Clínica", href: "/jefe/historia-clinica", icon: FileText },
    { label: "Facturación", href: "/jefe/facturacion", icon: Receipt },
    { label: "Reportes", href: "/jefe/reportes", icon: BarChart3 },
  ],
  [UserRole.DOCTOR]: [
    { label: "Agenda", href: "/doctor/agenda", icon: Calendar },
    { label: "Pacientes", href: "/doctor/pacientes", icon: Users },
    { label: "Historia Clínica", href: "/doctor/historia-clinica", icon: FileText },
  ],
  [UserRole.SECRETARIA]: [
    { label: "Agenda", href: "/secretaria/agenda", icon: Calendar },
    { label: "Pacientes", href: "/secretaria/pacientes", icon: Users },
    { label: "Cobros", href: "/secretaria/cobros", icon: ShoppingCart },
  ],
  [UserRole.PACIENTE]: [
    { label: "Mis Citas", href: "/paciente/citas", icon: ClipboardList },
    { label: "Historial", href: "/paciente/historial", icon: FileText },
    { label: "Documentos", href: "/paciente/documentos", icon: FileText },
    { label: "Saldo", href: "/paciente/saldo", icon: Wallet },
  ],
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { usuario, rol } = useAuth();
  const [abierto, setAbierto] = useState(false);

  const items = rol ? NAV_ITEMS[rol] : [];
  const etiquetaRol = rol ? ROLE_LABEL[rol] : "";

  const contenidoSidebar = (
    <div className="flex h-full flex-col">
      {/* Logo y nombre del sistema */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Stethoscope className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">DentaSync</span>
      </div>

      {/* Datos del usuario */}
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {usuario?.nombre?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <Badge variant="secondary" className="mt-0.5 text-xs">
              {etiquetaRol}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAbierto(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activo
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Sidebar fijo en desktop */}
      <aside
        className={cn(
          "hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col",
          className
        )}
      >
        {contenidoSidebar}
      </aside>

      {/* Botón hamburguesa en mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setAbierto(!abierto)}
      >
        {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay y sidebar móvil */}
      {abierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setAbierto(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background md:hidden">
            {contenidoSidebar}
          </aside>
        </>
      )}
    </>
  );
}
