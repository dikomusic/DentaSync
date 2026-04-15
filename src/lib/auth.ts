import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { UserRole, ROLE_DEFAULT_ROUTE } from "@/types/roles.types";
import type { SessionUser } from "@/types/user.types";

// ─── Extensión de tipos de next-auth ───────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: SessionUser & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    role: UserRole;
    tenantId: string | null;
    consultorioNombre: string | null;
    avatarUrl?: string;
  }
}

// next-auth/jwt no existe como módulo augmentable en v5 beta —
// se usa una interfaz local y se castea en los callbacks
interface DentaSyncJWT {
  sub?: string;
  email?: string | null;
  iat?: number;
  exp?: number;
  jti?: string;
  id: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  tenantId: string | null;
  consultorioNombre: string | null;
  avatarUrl?: string;
}

// ─── Usuarios demo (solo para desarrollo sin backend) ──────────────────────
// TODO: Eliminar cuando el backend NestJS esté listo
const USUARIOS_DEMO: Record<string, {
  id: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  tenantId: string | null;
  consultorioNombre: string | null;
  password: string;
}> = {
  "super@dentasync.com": {
    id: "usr_super_001",
    nombre: "Carlos",
    apellido: "Administrador",
    role: UserRole.SUPER_ADMIN,
    tenantId: null,
    consultorioNombre: null,
    password: "Demo1234!",
  },
  "jefe@dentasync.com": {
    id: "usr_jefe_001",
    nombre: "María",
    apellido: "Rodríguez",
    role: UserRole.DOCTOR_JEFE,
    tenantId: "tenant_demo_001",
    consultorioNombre: "Clínica Dental Sonrisa",
    password: "Demo1234!",
  },
  "doctor@dentasync.com": {
    id: "usr_doc_001",
    nombre: "Pedro",
    apellido: "González",
    role: UserRole.DOCTOR,
    tenantId: "tenant_demo_001",
    consultorioNombre: "Clínica Dental Sonrisa",
    password: "Demo1234!",
  },
  "secretaria@dentasync.com": {
    id: "usr_sec_001",
    nombre: "Laura",
    apellido: "Martínez",
    role: UserRole.SECRETARIA,
    tenantId: "tenant_demo_001",
    consultorioNombre: "Clínica Dental Sonrisa",
    password: "Demo1234!",
  },
  "paciente@dentasync.com": {
    id: "usr_pac_001",
    nombre: "Juan",
    apellido: "López",
    role: UserRole.PACIENTE,
    tenantId: "tenant_demo_001",
    consultorioNombre: "Clínica Dental Sonrisa",
    password: "Demo1234!",
  },
};

// ─── Schema de validación de credenciales ──────────────────────────────────
const credencialesSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
});

// ─── Configuración de NextAuth ──────────────────────────────────────────────
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",      type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        // 1. Validar formato
        const parsed = credencialesSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. TODO: Reemplazar con llamada al backend NestJS
        // const res = await apiClient.post<LoginResponse>("/auth/login", { email, password })
        // if (!res.data?.accessToken) return null
        // return res.data.user

        // 3. Demo: verificar contra usuarios hardcodeados
        const usuario = USUARIOS_DEMO[email.toLowerCase()];
        if (!usuario || usuario.password !== password) return null;

        return {
          id:                usuario.id,
          email,
          nombre:            usuario.nombre,
          apellido:          usuario.apellido,
          role:              usuario.role,
          tenantId:          usuario.tenantId,
          consultorioNombre: usuario.consultorioNombre,
        };
      },
    }),
  ],

  callbacks: {
    // Persistir datos del usuario en el JWT — se retorna un objeto nuevo para evitar
    // conflictos de tipo con Record<string, unknown> de la firma base de JWT
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id:                user.id,
          nombre:            user.nombre,
          apellido:          user.apellido,
          role:              user.role,
          tenantId:          user.tenantId,
          consultorioNombre: user.consultorioNombre,
          avatarUrl:         user.avatarUrl,
        };
      }
      return token;
    },

    // Exponer campos del JWT en la sesión del cliente.
    // Cast explícito a DentaSyncJWT porque next-auth v5 beta tipa token como
    // Record<string,unknown> y no permite augmentar next-auth/jwt
    async session({ session, token }) {
      const jwt = token as unknown as DentaSyncJWT;
      session.user.id                = jwt.id;
      session.user.nombre            = jwt.nombre;
      session.user.apellido          = jwt.apellido;
      session.user.role              = jwt.role;
      session.user.tenantId          = jwt.tenantId;
      session.user.consultorioNombre = jwt.consultorioNombre;
      session.user.avatarUrl         = jwt.avatarUrl;
      return session;
    },
  },

  // JWT stateless — obligatorio para arquitectura multi-tenant
  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 horas
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper: obtiene la ruta de destino post-login para un rol dado
export function getRutaPostLogin(role: UserRole): string {
  return ROLE_DEFAULT_ROUTE[role];
}
