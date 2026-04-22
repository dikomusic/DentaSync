import { format } from "date-fns";
import type {
  Paciente,
  EstadoPaciente,
  ClasificacionPaciente,
  SeveridadAlergia,
  TipoAntecedente,
  TipoDocumento,
  TipoConvenio,
} from "@/modules/pacientes/types/pacientes.types";

// ─── Tipos que reflejan el resultado de la query Prisma con includes ──────────

export type ContactoEmergenciaDB = {
  contactoId: string;
  nombre: string;
  parentesco: string | null;
  telefono: string;
};

export type AnamnesisDB = {
  anamnesisId: string;
  grupoSanguineo: string | null;
  medicacion: string[];
  notasClinicas: string | null;
  actualizadoEn: Date;
};

export type AlergiaPacienteDB = {
  alergiaId: string;
  sustancia: string;
  severidad: string;
  reaccion: string | null;
  fechaDeteccion: Date | null;
  registradoPor: string | null;
  creadoEn: Date;
};

export type AntecedenteClinicoDb = {
  antecedenteId: string;
  tipo: string;
  descripcion: string;
  activo: boolean;
  creadoEn: Date;
};

export type ConvenioPacienteDB = {
  convenioId: string;
  tipo: string;
  nombreEntidad: string;
  numeroPoliza: string | null;
  porcentajeDescuento: number;
  vigenciaDesde: Date;
  vigenciaHasta: Date | null;
  activo: boolean;
};

export type DocumentoPacienteDB = {
  documentoId: string;
  nombre: string;
  tipo: string;
  tamanioKb: number | null;
  subidoEn: Date;
  subidoPor: string | null;
};

export type HistorialEstadoDB = {
  historialId: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  motivo: string | null;
  cambiadoPor: string | null;
  cambiadoEn: Date;
};

export type CitaDB = {
  fechaHora: Date;
  estado: string;
};

export type CobroSaldoDB = {
  saldoPendiente: { toNumber(): number } | number;
};

export type PacienteDB = {
  pacienteId: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: Date;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string;
  clasificacion: string;
  motivoEstado: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  contactoEmergencia: ContactoEmergenciaDB[];
  anamnesis: AnamnesisDB | null;
  alergiasPaciente: AlergiaPacienteDB[];
  antecedentesClinicos: AntecedenteClinicoDb[];
  convenioPaciente: ConvenioPacienteDB | null;
  documentos: DocumentoPacienteDB[];
  historialEstado: HistorialEstadoDB[];
  citas: CitaDB[];
  cobros: CobroSaldoDB[];
};

// ─── Include reutilizable para todas las queries ──────────────────────────────

export const INCLUDE_PACIENTE = {
  contactoEmergencia:   true,
  anamnesis:            true,
  alergiasPaciente:     { orderBy: { creadoEn: "desc" as const } },
  antecedentesClinicos: { orderBy: { creadoEn: "desc" as const } },
  convenioPaciente:     true,
  documentos:           { orderBy: { subidoEn: "desc" as const } },
  historialEstado: {
    orderBy: { cambiadoEn: "desc" as const },
    take: 20,
  },
  citas: {
    select: { fechaHora: true, estado: true },
    orderBy: { fechaHora: "asc" as const },
  },
  cobros: {
    select: { saldoPendiente: true },
  },
} as const;

// ─── Función principal de transformación ─────────────────────────────────────

function d(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function transformarPaciente(p: PacienteDB): Paciente {
  const citas = p.citas ?? [];
  const cobros = p.cobros ?? [];

  const totalCitas = citas.length;
  const primeraCitaFecha = citas.length > 0 ? d(citas[0].fechaHora) : undefined;
  const ultimaCitaFecha  = citas.length > 0 ? d(citas[citas.length - 1].fechaHora) : undefined;
  const saldoPendiente   = cobros.reduce((sum, c) => {
    const val = typeof c.saldoPendiente === "number"
      ? c.saldoPendiente
      : c.saldoPendiente.toNumber();
    return sum + val;
  }, 0);

  const alergias = (p.alergiasPaciente ?? []).map((a) => ({
    id:             a.alergiaId,
    sustancia:      a.sustancia,
    severidad:      a.severidad as SeveridadAlergia,
    reaccion:       a.reaccion ?? "",
    fechaDeteccion: a.fechaDeteccion ? d(a.fechaDeteccion) : d(a.creadoEn),
    registradoPor:  a.registradoPor ?? "Sistema",
  }));

  const antecedentesArr = (p.antecedentesClinicos ?? []).map((ant) => ({
    id:            ant.antecedenteId,
    tipo:          ant.tipo as TipoAntecedente,
    descripcion:   ant.descripcion,
    fechaRegistro: d(ant.creadoEn),
    activo:        ant.activo,
  }));

  const tieneAntecedentes =
    p.anamnesis !== null ||
    alergias.length > 0 ||
    antecedentesArr.length > 0;

  const antecedentes = tieneAntecedentes
    ? {
        grupoSanguineo:      p.anamnesis?.grupoSanguineo ?? undefined,
        antecedentes:        antecedentesArr,
        alergias,
        medicamentosActuales: p.anamnesis?.medicacion ?? [],
        notasAdicionales:    p.anamnesis?.notasClinicas ?? undefined,
        actualizadoEn:       p.anamnesis ? d(p.anamnesis.actualizadoEn) : d(new Date()),
      }
    : undefined;

  const convenio = p.convenioPaciente
    ? {
        id:                  p.convenioPaciente.convenioId,
        tipo:                p.convenioPaciente.tipo as TipoConvenio,
        nombreEntidad:       p.convenioPaciente.nombreEntidad,
        numeroPoliza:        p.convenioPaciente.numeroPoliza ?? undefined,
        porcentajeDescuento: p.convenioPaciente.porcentajeDescuento,
        vigenciaDesde:       d(p.convenioPaciente.vigenciaDesde),
        vigenciaHasta:       p.convenioPaciente.vigenciaHasta
          ? d(p.convenioPaciente.vigenciaHasta)
          : undefined,
        activo: p.convenioPaciente.activo,
      }
    : undefined;

  const documentos = (p.documentos ?? []).map((doc) => ({
    id:          doc.documentoId,
    nombre:      doc.nombre,
    tipo:        doc.tipo as TipoDocumento,
    tamanioKb:   doc.tamanioKb ?? 0,
    subidoEn:    d(doc.subidoEn),
    subidoPor:   doc.subidoPor ?? "Sistema",
  }));

  const historialCambios = (p.historialEstado ?? []).map((h) => ({
    id:            h.historialId,
    campo:         "Estado",
    valorAnterior: h.estadoAnterior ?? "",
    valorNuevo:    h.estadoNuevo ?? "",
    modificadoPor: h.cambiadoPor ?? "Sistema",
    modificadoEn:  h.cambiadoEn.toISOString(),
  }));

  return {
    id:                 p.pacienteId,
    nombre:             p.nombre,
    apellido:           p.apellido,
    dni:                p.dni,
    fechaNacimiento:    d(p.fechaNacimiento),
    genero:             (p.genero as "M" | "F" | "OTRO") ?? "OTRO",
    telefono:           p.telefono ?? "",
    telefonoEmergencia: p.contactoEmergencia?.[0]?.telefono,
    email:              p.email ?? undefined,
    direccion:          p.direccion ?? undefined,
    ciudad:             p.ciudad ?? undefined,
    estado:             p.estado as EstadoPaciente,
    clasificacion:      p.clasificacion as ClasificacionPaciente,
    motivoEstado:       p.motivoEstado ?? undefined,
    antecedentes,
    convenio,
    documentos,
    historialCambios,
    primeraCitaFecha,
    ultimaCitaFecha,
    totalCitas,
    saldoPendiente,
    creadoEn:      d(p.creadoEn),
    actualizadoEn: d(p.actualizadoEn),
  };
}
