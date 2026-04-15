import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/types/roles.types";
import type { SessionUser } from "@/types/user.types";
import { setAuthToken, clearAuthToken, setTenantId } from "@/lib/api-client";

interface AuthState {
  // Estado
  user: SessionUser | null;
  token: string | null;
  tenantId: string | null;
  role: UserRole | null;
  isLoading: boolean;

  // Acciones
  setUser: (user: SessionUser, token: string) => void;
  clearUser: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      user:      null,
      token:     null,
      tenantId:  null,
      role:      null,
      isLoading: false,

      // Guarda el usuario y configura el cliente axios con token y tenantId
      setUser: (user, token) => {
        setAuthToken(token);
        if (user.tenantId) setTenantId(user.tenantId);

        set({
          user,
          token,
          tenantId: user.tenantId,
          role:     user.role,
        });
      },

      // Limpia toda la sesión y revoca el token en el cliente
      clearUser: () => {
        clearAuthToken();
        set({
          user:     null,
          token:    null,
          tenantId: null,
          role:     null,
        });
      },

      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "dentasync-auth", // clave en localStorage
      // Solo persistir los datos esenciales, no isLoading
      partialize: (state) => ({
        user:     state.user,
        token:    state.token,
        tenantId: state.tenantId,
        role:     state.role,
      }),
    }
  )
);

// Alias para compatibilidad con el hook use-auth (usa cerrarSesion)
export type { AuthState };
