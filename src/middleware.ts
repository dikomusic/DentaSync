import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PROTECTED_ROUTE_ROLES, ROLE_DEFAULT_ROUTE } from "@/types/roles.types";

// Rutas públicas que no requieren autenticación
const RUTAS_PUBLICAS = ["/login", "/register", "/recover"];

// Rutas de la API que no deben ser interceptadas
const RUTAS_API = ["/api/auth"];

// req es NextAuthRequest — next-auth v5 lo extiende con req.auth automáticamente
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const sesion = req.auth;

  // Dejar pasar rutas de API de auth
  if (RUTAS_API.some((ruta) => pathname.startsWith(ruta))) {
    return NextResponse.next();
  }

  // Redirigir raíz según estado de sesión
  if (pathname === "/") {
    if (sesion?.user?.role) {
      const rutaDestino = ROLE_DEFAULT_ROUTE[sesion.user.role];
      return NextResponse.redirect(new URL(rutaDestino, req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Permitir rutas públicas sin autenticación
  if (RUTAS_PUBLICAS.some((ruta) => pathname.startsWith(ruta))) {
    // Si ya está autenticado y trata de ir al login, redirigir a su dashboard
    if (sesion?.user?.role) {
      const rutaDestino = ROLE_DEFAULT_ROUTE[sesion.user.role];
      return NextResponse.redirect(new URL(rutaDestino, req.url));
    }
    return NextResponse.next();
  }

  // A partir de aquí: rutas protegidas
  // Si no hay sesión, redirigir al login
  if (!sesion?.user) {
    const urlLogin = new URL("/login", req.url);
    urlLogin.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(urlLogin);
  }

  const rolUsuario = sesion.user.role;

  // Verificar que el rol tiene permisos para la ruta actual
  const prefijoRuta = Object.keys(PROTECTED_ROUTE_ROLES).find((prefijo) =>
    pathname.startsWith(prefijo)
  );

  if (prefijoRuta) {
    const rolesPermitidos = PROTECTED_ROUTE_ROLES[prefijoRuta];
    const tieneAcceso = rolUsuario && rolesPermitidos.includes(rolUsuario);

    if (!tieneAcceso) {
      // Redirigir al dashboard del rol que tiene asignado
      if (rolUsuario) {
        const rutaPropia = ROLE_DEFAULT_ROUTE[rolUsuario];
        return NextResponse.redirect(new URL(rutaPropia, req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

// Configurar qué rutas procesa el middleware
export const config = {
  matcher: [
    /*
     * Procesar todas las rutas excepto:
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - Archivos con extensión (imágenes, fuentes, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
