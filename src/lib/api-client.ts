import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// URL base del backend NestJS (configurar en .env)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// Instancia principal de axios con configuración base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de REQUEST: adjunta el token JWT y el tenant-id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // El token se obtiene desde la sesión de next-auth en el cliente
    // Se puede setear usando setAuthToken() antes de hacer la llamada
    const token = globalThis.__authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Header de tenant para el backend multi-tenant
    const tenantId = globalThis.__tenantId;
    if (tenantId) {
      config.headers["x-tenant-id"] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de RESPONSE: manejo centralizado de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido — redirigir al login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      // Sin permisos — redirigir a página de acceso denegado
      if (typeof window !== "undefined") {
        window.location.href = "/acceso-denegado";
      }
    }

    return Promise.reject(error);
  }
);

// Funciones para configurar el cliente desde el store de auth
export function setAuthToken(token: string): void {
  globalThis.__authToken = token;
}

export function clearAuthToken(): void {
  globalThis.__authToken = undefined;
  globalThis.__tenantId = undefined;
}

export function setTenantId(tenantId: string): void {
  globalThis.__tenantId = tenantId;
}

// Declaración para TypeScript del global
declare global {
  // eslint-disable-next-line no-var
  var __authToken: string | undefined;
  // eslint-disable-next-line no-var
  var __tenantId: string | undefined;
}

export default apiClient;
