import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/demo-tenant";
import { INCLUDE_PACIENTE, transformarPaciente, type PacienteDB } from "../_lib/transformar";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session  = await auth();
    const tenantId = resolveTenantId(session?.user?.tenantId);
    if (!tenantId) return Response.json({ error: "Sin tenant" }, { status: 401 });

    const paciente = await prisma.paciente.findFirst({
      where:   { pacienteId: id, tenantId },
      include: INCLUDE_PACIENTE,
    });

    if (!paciente) return Response.json({ error: "No encontrado" }, { status: 404 });

    return Response.json(transformarPaciente(paciente as unknown as PacienteDB));
  } catch (err) {
    console.error("[GET /api/pacientes/[id]]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session  = await auth();
    const tenantId = resolveTenantId(session?.user?.tenantId);
    if (!tenantId) return Response.json({ error: "Sin tenant" }, { status: 401 });

    const body = await req.json() as {
      nombre?:             string;
      apellido?:           string;
      dni?:                string;
      fechaNacimiento?:    string;
      genero?:             string;
      telefono?:           string;
      telefonoEmergencia?: string;
      email?:              string;
      direccion?:          string;
      ciudad?:             string;
    };

    const { telefonoEmergencia, fechaNacimiento, ...resto } = body;

    await prisma.paciente.update({
      where: { pacienteId: id },
      data: {
        ...resto,
        ...(fechaNacimiento && { fechaNacimiento: new Date(fechaNacimiento) }),
      },
    });

    if (telefonoEmergencia !== undefined) {
      const contacto = await prisma.contactoEmergencia.findFirst({ where: { pacienteId: id } });
      if (contacto) {
        await prisma.contactoEmergencia.update({
          where: { contactoId: contacto.contactoId },
          data:  { telefono: telefonoEmergencia },
        });
      } else if (telefonoEmergencia) {
        await prisma.contactoEmergencia.create({
          data: { pacienteId: id, nombre: "Contacto de emergencia", telefono: telefonoEmergencia },
        });
      }
    }

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB));
  } catch (err) {
    console.error("[PUT /api/pacientes/[id]]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
