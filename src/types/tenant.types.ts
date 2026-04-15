// Tipos para el modelo de Tenant (consultorio odontológico)
export enum TenantStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  SUSPENDIDO = "SUSPENDIDO",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  BASICO = "BASICO",
  PROFESIONAL = "PROFESIONAL",
  ENTERPRISE = "ENTERPRISE",
}

export interface Tenant {
  id: string;
  nombre: string;
  slug: string; // identificador único de URL (ej: "clinica-del-sol")
  estado: TenantStatus;
  plan: SubscriptionPlan;
  logoUrl?: string;
  // Datos del consultorio
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  pais: string;
  // Fechas
  creadoEn: Date;
  actualizadoEn: Date;
  // Suscripción
  suscripcionVence?: Date;
}

export interface CreateTenantDto {
  nombre: string;
  slug: string;
  plan: SubscriptionPlan;
  pais: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {
  estado?: TenantStatus;
  logoUrl?: string;
}
