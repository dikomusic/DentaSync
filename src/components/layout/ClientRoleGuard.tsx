"use client";

import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types/roles.types";

interface ClientRoleGuardProps {
  rolesPermitidos: UserRole | UserRole[];
  children: React.ReactNode;
  // Qué mostrar si no tiene permisos (null por defecto = nada)
  fallback?: React.ReactNode;
}

/**
 * Client Component para ocultar/mostrar elementos de la UI según rol.
 * No redirige — solo oculta el contenido si el rol no coincide.
 *
 * Ejemplo:
 * <ClientRoleGuard rolesPermitidos={[UserRole.DOCTOR_JEFE]}>
 *   <BotonesAdministracion />
 * </ClientRoleGuard>
 */
export function ClientRoleGuard({ rolesPermitidos, children, fallback = null }: ClientRoleGuardProps) {
  const { tieneRol } = useAuth();

  if (!tieneRol(rolesPermitidos)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
