import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureDemoTenant, resolveTenantId } from "@/lib/demo-tenant";
import { INCLUDE_PACIENTE, transformarPaciente, type PacienteDB } from "./_lib/transformar";

export async function GET() {
  try {
    const session = await auth();
    const tenantId = resolveTenantId(session?.user?.tenantId);
    if (!tenantId) return Response.json({ error: "Sin tenant" }, { status: 401 });

    await ensureDemoTenant();

    const rows = await prisma.paciente.findMany({
      where:   { tenantId },
      include: INCLUDE_PACIENTE,
      orderBy: { creadoEn: "desc" },
    });

    return Response.json(rows.map((r) => transformarPaciente(r as unknown as PacienteDB)));
  } catch (err) {
    console.error("[GET /api/pacientes]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const tenantId = resolveTenantId(session?.user?.tenantId);
    if (!tenantId) return Response.json({ error: "Sin tenant" }, { status: 401 });

    await ensureDemoTenant();

    const body = await req.json() as {
      nombre:              string;
      apellido:            string;
      dni:                 string;
      fechaNacimiento:     string;
      genero:              string;
      telefono:            string;
      telefonoEmergencia?: string;
      email?:              string;
      direccion?:          string;
      ciudad?:             string;
    };

    const existe = await prisma.paciente.findFirst({
      where: { tenantId, dni: body.dni },
    });
    if (existe) {
      return Response.json({ error: "Ya existe un paciente con ese DNI" }, { status: 409 });
    }

    const nuevo = await prisma.paciente.create({
      data: {
        tenantId,
        nombre:          body.nombre,
        apellido:        body.apellido,
        dni:             body.dni,
        fechaNacimiento: new Date(body.fechaNacimiento),
        genero:          body.genero,
        telefono:        body.telefono,
        email:           body.email,
        direccion:       body.direccion,
        ciudad:          body.ciudad,
        estado:          "ACTIVO",
        clasificacion:   "NUEVO",
        ...(body.telefonoEmergencia && {
          contactoEmergencia: {
            create: { nombre: "Contacto de emergencia", telefono: body.telefonoEmergencia },
          },
        }),
      },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(nuevo as unknown as PacienteDB), { status: 201 });
  } catch (err) {
    console.error("[POST /api/pacientes]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
