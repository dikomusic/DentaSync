"use client";

import { useSession, signOut } from "next-auth/react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/roles.types";
import type { SessionUser } from "@/types/user.types";

interface UseAuthReturn {
  // Estado de la sesión
  usuario: SessionUser | null;
  rol: UserRole | null;
  tenantId: string | null;
  estaAutenticado: boolean;
  cargando: boolean;

  // Verificadores de rol
  esSuperAdmin: boolean;
  esDoctorJefe: boolean;
  esDoctor: boolean;     // Doctor Especialista
  esAnyDoctor: boolean;  // true para DOCTOR_JEFE o DOCTOR
  esSecretaria: boolean;
  esPaciente: boolean;

  // Acciones
  cerrarSesion: () => Promise<void>;
  tieneRol: (roles: UserRole | UserRole[]) => boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: sesion, status } = useSession();
  const { clearUser: limpiarStore } = useAuthStore();
  const router = useRouter();

  // Datos del usuario desde next-auth
  const usuario = sesion?.user ?? null;
  const rol = (usuario?.role as UserRole) ?? null;
  const tenantId = usuario?.tenantId ?? null;
  const estaAutenticado = status === "authenticated";
  const cargando = status === "loading";

  // Verificadores de rol
  const esSuperAdmin = rol === UserRole.SUPER_ADMIN;
  const esDoctorJefe = rol === UserRole.DOCTOR_JEFE;
  const esDoctor     = rol === UserRole.DOCTOR;
  const esAnyDoctor  = esDoctorJefe || esDoctor;
  const esSecretaria = rol === UserRole.SECRETARIA;
  const esPaciente   = rol === UserRole.PACIENTE;

  // Verifica si el usuario tiene uno o más roles específicos
  const tieneRol = (roles: UserRole | UserRole[]): boolean => {
    if (!rol) return false;
    return Array.isArray(roles) ? roles.includes(rol) : rol === roles;
  };

  // Cierra sesión y limpia el store de Zustand
  const cerrarSesion = async (): Promise<void> => {
    limpiarStore();
    await signOut({ redirect: false });
    router.push("/login");
  };

  return {
    usuario: usuario as SessionUser | null,
    rol,
    tenantId,
    estaAutenticado,
    cargando,
    esSuperAdmin,
    esDoctorJefe,
    esDoctor,
    esAnyDoctor,
    esSecretaria,
    esPaciente,
    cerrarSesion,
    tieneRol,
  };
}
