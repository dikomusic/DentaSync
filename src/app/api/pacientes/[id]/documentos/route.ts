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
      nombre:       string;
      tipo:         string;
      descripcion?: string;
      tamanioKb:    number;
    };

    await prisma.documentoPaciente.create({
      data: {
        pacienteId: id,
        nombre:     body.nombre,
        tipo:       body.tipo,
        tamanioKb:  body.tamanioKb,
        url:        `/docs/${id}/${Date.now()}_${body.nombre}`,
        subidoPor:  null,
      },
    });

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB), { status: 201 });
  } catch (err) {
    console.error("[POST /api/pacientes/[id]/documentos]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
