import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveTenantId } from "@/lib/demo-tenant";
import { INCLUDE_PACIENTE, transformarPaciente, type PacienteDB } from "../../_lib/transformar";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session  = await auth();
    const tenantId = resolveTenantId(session?.user?.tenantId);
    if (!tenantId) return Response.json({ error: "Sin tenant" }, { status: 401 });

    const body = await req.json() as {
      tipo:        string;
      descripcion: string;
    };

    await prisma.antecedenteClinico.create({
      data: {
        pacienteId:  id,
        tipo:        body.tipo,
        descripcion: body.descripcion,
        activo:      true,
      },
    });

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB), { status: 201 });
  } catch (err) {
    console.error("[POST /api/pacientes/[id]/antecedentes]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
