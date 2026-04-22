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
      sustancia:      string;
      severidad:      string;
      reaccion:       string;
      fechaDeteccion: string;
    };

    await prisma.alergiaPaciente.create({
      data: {
        pacienteId:     id,
        sustancia:      body.sustancia,
        severidad:      body.severidad,
        reaccion:       body.reaccion,
        fechaDeteccion: body.fechaDeteccion ? new Date(body.fechaDeteccion) : null,
        registradoPor:  session?.user?.nombre ?? "Sistema",
      },
    });

    // Marcar alertaCritica si hay alergia GRAVE
    if (body.severidad === "GRAVE") {
      await prisma.anamnesis.upsert({
        where:  { pacienteId: id },
        create: { pacienteId: id, alertaCritica: true },
        update: { alertaCritica: true },
      });
    }

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB), { status: 201 });
  } catch (err) {
    console.error("[POST /api/pacientes/[id]/alergias]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
