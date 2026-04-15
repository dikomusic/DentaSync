import { UserRole } from "./roles.types";

// Tipo base de usuario del sistema
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  tenantId: string | null;          // null para SUPER_ADMIN
  consultorioNombre: string | null; // null para SUPER_ADMIN
  avatarUrl?: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

// Payload que viaja dentro del JWT
export interface JwtPayload {
  sub: string;                       // userId
  email: string;
  nombre: string;
  role: UserRole;
  tenantId: string | null;
  consultorioNombre: string | null;
  iat?: number;
  exp?: number;
}

// Sesión extendida para next-auth (lo que el cliente puede leer)
export interface SessionUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  tenantId: string | null;
  consultorioNombre: string | null;
  avatarUrl?: string;
}

// DTOs para operaciones de usuario
export interface CreateUserDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  tenantId: string;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  avatarUrl?: string;
  activo?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SessionUser;
}
