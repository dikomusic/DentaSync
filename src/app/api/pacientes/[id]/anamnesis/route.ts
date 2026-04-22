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
      grupoSanguineo?:     string;
      medicamentosActuales?: string[];
      notasAdicionales?:   string;
    };

    await prisma.anamnesis.upsert({
      where:  { pacienteId: id },
      create: {
        pacienteId:    id,
        grupoSanguineo: body.grupoSanguineo,
        medicacion:    body.medicamentosActuales ?? [],
        notasClinicas: body.notasAdicionales,
        actualizadoEn: new Date(),
      },
      update: {
        grupoSanguineo: body.grupoSanguineo,
        medicacion:    body.medicamentosActuales,
        notasClinicas: body.notasAdicionales,
        actualizadoEn: new Date(),
      },
    });

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB));
  } catch (err) {
    console.error("[PUT /api/pacientes/[id]/anamnesis]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
