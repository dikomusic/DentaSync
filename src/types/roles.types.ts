// Roles del sistema DentaSync
export enum UserRole {
  SUPER_ADMIN   = "SUPER_ADMIN",
  DOCTOR_JEFE   = "DOCTOR_JEFE",
  DOCTOR        = "DOCTOR",        // Doctor Especialista
  SECRETARIA    = "SECRETARIA",
  PACIENTE      = "PACIENTE",
}

// Prefijos de ruta para cada rol (usados en middleware y RoleGuard)
export const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/super-admin",
  [UserRole.DOCTOR_JEFE]: "/jefe",
  [UserRole.DOCTOR]:      "/doctor",
  [UserRole.SECRETARIA]:  "/secretaria",
  [UserRole.PACIENTE]:    "/paciente",
};

// Ruta de inicio (redirect) por rol después del login
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/super-admin/tenants",
  [UserRole.DOCTOR_JEFE]: "/jefe/agenda",
  [UserRole.DOCTOR]:      "/doctor/agenda",
  [UserRole.SECRETARIA]:  "/secretaria/agenda",
  [UserRole.PACIENTE]:    "/paciente/citas",
};

// Etiquetas legibles en español por rol
export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Administrador",
  [UserRole.DOCTOR_JEFE]: "Doctor en Jefe",
  [UserRole.DOCTOR]:      "Doctor Especialista",
  [UserRole.SECRETARIA]:  "Secretaria",
  [UserRole.PACIENTE]:    "Paciente",
};

// Rutas protegidas: qué roles pueden acceder a cada prefijo
export const PROTECTED_ROUTE_ROLES: Record<string, UserRole[]> = {
  "/super-admin": [UserRole.SUPER_ADMIN],
  "/jefe":        [UserRole.DOCTOR_JEFE],
  "/doctor":      [UserRole.DOCTOR],
  "/secretaria":  [UserRole.SECRETARIA],
  "/paciente":    [UserRole.PACIENTE],
};
