import { prisma } from "./prisma";

// UUID fijo para el tenant demo de desarrollo.
// Mapea el tenantId de la sesión NextAuth al UUID real de la BD.
export const DEMO_TENANT_UUID = "11111111-1111-1111-1111-111111111111";

const SESSION_TO_UUID: Record<string, string> = {
  tenant_demo_001: DEMO_TENANT_UUID,
};

export function resolveTenantId(sessionTenantId: string | null | undefined): string | null {
  if (!sessionTenantId) return null;
  return SESSION_TO_UUID[sessionTenantId] ?? sessionTenantId;
}

let _ensured = false;

export async function ensureDemoTenant(): Promise<void> {
  if (_ensured) return;
  await prisma.tenant.upsert({
    where:  { tenantId: DEMO_TENANT_UUID },
    create: { tenantId: DEMO_TENANT_UUID, nombre: "Clínica Dental Sonrisa", estado: "activo" },
    update: {},
  });
  _ensured = true;
}
