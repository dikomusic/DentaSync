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
      tipo:                string;
      nombreEntidad:       string;
      numeroPoliza?:       string;
      porcentajeDescuento: number;
      vigenciaDesde:       string;
      vigenciaHasta?:      string;
    };

    await prisma.convenioPaciente.upsert({
      where:  { pacienteId: id },
      create: {
        pacienteId:          id,
        tipo:                body.tipo,
        nombreEntidad:       body.nombreEntidad,
        numeroPoliza:        body.numeroPoliza,
        porcentajeDescuento: body.porcentajeDescuento,
        vigenciaDesde:       new Date(body.vigenciaDesde),
        vigenciaHasta:       body.vigenciaHasta ? new Date(body.vigenciaHasta) : null,
        activo:              true,
      },
      update: {
        tipo:                body.tipo,
        nombreEntidad:       body.nombreEntidad,
        numeroPoliza:        body.numeroPoliza,
        porcentajeDescuento: body.porcentajeDescuento,
        vigenciaDesde:       new Date(body.vigenciaDesde),
        vigenciaHasta:       body.vigenciaHasta ? new Date(body.vigenciaHasta) : null,
        activo:              true,
      },
    });

    // Actualizar clasificación a CONVENIO automáticamente
    await prisma.paciente.update({
      where: { pacienteId: id },
      data:  { clasificacion: "CONVENIO" },
    });

    const actualizado = await prisma.paciente.findUniqueOrThrow({
      where:   { pacienteId: id },
      include: INCLUDE_PACIENTE,
    });

    return Response.json(transformarPaciente(actualizado as unknown as PacienteDB));
  } catch (err) {
    console.error("[PUT /api/pacientes/[id]/convenio]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
