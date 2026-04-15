// Handler de NextAuth v5 para App Router
// Procesa todas las rutas de /api/auth/* (signin, signout, session, etc.)
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
