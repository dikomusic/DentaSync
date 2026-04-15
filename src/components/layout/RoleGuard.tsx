import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole, ROLE_DEFAULT_ROUTE } from "@/types/roles.types";

interface RoleGuardProps {
  // Rol o roles que tienen acceso a este componente
  rolesPermitidos: UserRole | UserRole[];
  children: React.ReactNode;
  // Opcional: ruta alternativa si no tiene acceso (por defecto redirige al dashboard del rol)
  redirigirA?: string;
}

/**
 * Server Component para proteger secciones de la UI por rol.
 * Úsalo en layouts o páginas Server Component.
 *
 * Ejemplo:
 * <RoleGuard rolesPermitidos={[UserRole.DOCTOR_JEFE]}>
 *   <SeccionExclusiva />
 * </RoleGuard>
 */
export async function RoleGuard({ rolesPermitidos, children, redirigirA }: RoleGuardProps) {
  const sesion = await auth();

  // Sin sesión: redirigir al login
  if (!sesion?.user) {
    redirect("/login");
  }

  const rolUsuario = sesion.user.role as UserRole;

  // Verificar que el rol tiene acceso
  const rolesArray = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
  const tieneAcceso = rolesArray.includes(rolUsuario);

  if (!tieneAcceso) {
    const destino = redirigirA ?? ROLE_DEFAULT_ROUTE[rolUsuario];
    redirect(destino);
  }

  return <>{children}</>;
}
