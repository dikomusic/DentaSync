import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/demo-tenant";
import { INCLUDE_PACIENTE, transformarPaciente, type PacienteDB } from "../../_lib/transformar";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session  = await auth();
    const tenantId = resolveTenantId(session?.user?.tenantId);
    if (!tenantId) return Response.json({ error: "Sin tenant" }, { status: 401 });

    const body = await req.json() as {
      estado:        string;
      clasificacion: string;
      motivo?:       string;
    };

    const pacienteActual = await prisma.paciente.findFirst({
      where:  { pacienteId: id, tenantId },
      select: { estado: true, clasificacion: true },
    });
    if (!pacienteActual) return Response.json({ error: "No encontrado" }, { status: 404 });

    await prisma.paciente.update({
      where: { pacienteId: id },
      data: {
        estado:        body.estado,
        clasificacion: body.clasificacion,
        motivoEstado:  body.motivo,
      },
    });

    await prisma.historialEstadoPac.create({
      data: {
        pacienteId:     id,
        estadoAnterior: pacienteActual.estado,
        estadoNuevo:    body.estado,
        motivo:         body.motivo,
        cambiadoPor:    null,
      },
    });

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB));
  } catch (err) {
    console.error("[PUT /api/pacientes/[id]/clasificar]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
