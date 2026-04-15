import {
  type Especialidad,
  type DoctorAgenda,
  type PacienteResumen,
  type Cita,
  type ItemListaEspera,
  EstadoCita,
  PrioridadEspera,
} from "../types/agenda.types";
import { format, addDays, startOfWeek } from "date-fns";

// ─── Especialidades ─────────────────────────────────────────────────────────

export const ESPECIALIDADES: Especialidad[] = [
  { id: "esp-01", nombre: "Odontología General",  duracionDefaultMin: 45, color: "#3b82f6" },
  { id: "esp-02", nombre: "Ortodoncia",            duracionDefaultMin: 30, color: "#8b5cf6" },
  { id: "esp-03", nombre: "Endodoncia",            duracionDefaultMin: 60, color: "#ef4444" },
  { id: "esp-04", nombre: "Periodoncia",           duracionDefaultMin: 45, color: "#10b981" },
  { id: "esp-05", nombre: "Estética Dental",       duracionDefaultMin: 60, color: "#f59e0b" },
  { id: "esp-06", nombre: "Cirugía Oral",          duracionDefaultMin: 90, color: "#ec4899" },
];

// ─── Doctores ───────────────────────────────────────────────────────────────

export const DOCTORES: DoctorAgenda[] = [
  {
    id: "doc-01",
    nombre: "María",
    apellido: "Rodríguez",
    especialidades: ["esp-01", "esp-05"],
    activo: true,
  },
  {
    id: "doc-02",
    nombre: "Pedro",
    apellido: "González",
    especialidades: ["esp-02"],
    activo: true,
  },
  {
    id: "doc-03",
    nombre: "Ana",
    apellido: "Martínez",
    especialidades: ["esp-03", "esp-06"],
    activo: true,
  },
  {
    id: "doc-04",
    nombre: "Luis",
    apellido: "Fernández",
    especialidades: ["esp-04", "esp-01"],
    activo: true,
  },
  {
    id: "doc-05",
    nombre: "Carmen",
    apellido: "López",
    especialidades: ["esp-05", "esp-01"],
    activo: true,
  },
];

// ─── Pacientes ───────────────────────────────────────────────────────────────

export const PACIENTES: PacienteResumen[] = [
  { id: "pac-01", nombre: "Juan",    apellido: "Pérez",    telefono: "555-0101", email: "juan@mail.com" },
  { id: "pac-02", nombre: "Sofía",   apellido: "Ruiz",     telefono: "555-0102", email: "sofia@mail.com" },
  { id: "pac-03", nombre: "Carlos",  apellido: "Mendoza",  telefono: "555-0103" },
  { id: "pac-04", nombre: "Lucía",   apellido: "Gómez",    telefono: "555-0104", email: "lucia@mail.com" },
  { id: "pac-05", nombre: "Miguel",  apellido: "Torres",   telefono: "555-0105" },
  { id: "pac-06", nombre: "Valeria", apellido: "Castillo", telefono: "555-0106", email: "vale@mail.com" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function horaFin(horaInicio: string, minutos: number): string {
  const [h, m] = horaInicio.split(":").map(Number);
  const totalMin = h * 60 + m + minutos;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}

function especialidad(id: string) {
  return ESPECIALIDADES.find((e) => e.id === id)!;
}

// ─── Citas (semana actual) ────────────────────────────────────────────────

const hoy = new Date();
const lunEs = startOfWeek(hoy, { weekStartsOn: 1 }); // lunes de esta semana

function fecha(diasDesdeHoy: number) {
  return format(addDays(hoy, diasDesdeHoy), "yyyy-MM-dd");
}

function fechaSemana(diasDesdeLunes: number) {
  return format(addDays(lunEs, diasDesdeLunes), "yyyy-MM-dd");
}

export const CITAS_MOCK: Cita[] = [
  // ─── Lunes ────────────────────────────────────────────────────────────────
  {
    id: "cita-01",
    paciente: PACIENTES[0],
    doctor: DOCTORES[0],
    especialidadId: "esp-01",
    especialidadNombre: especialidad("esp-01").nombre,
    especialidadColor: especialidad("esp-01").color,
    fecha: fechaSemana(0),
    horaInicio: "09:00",
    horaFin: horaFin("09:00", 45),
    estado: EstadoCita.CONFIRMADA,
    motivoConsulta: "Revisión general",
    creadoEn: new Date().toISOString(),
  },
  {
    id: "cita-02",
    paciente: PACIENTES[1],
    doctor: DOCTORES[1],
    especialidadId: "esp-02",
    especialidadNombre: especialidad("esp-02").nombre,
    especialidadColor: especialidad("esp-02").color,
    fecha: fechaSemana(0),
    horaInicio: "10:00",
    horaFin: horaFin("10:00", 30),
    estado: EstadoCita.COMPLETADA,
    motivoConsulta: "Control de brackets",
    creadoEn: new Date().toISOString(),
  },
  // ─── Martes ───────────────────────────────────────────────────────────────
  {
    id: "cita-03",
    paciente: PACIENTES[2],
    doctor: DOCTORES[2],
    especialidadId: "esp-03",
    especialidadNombre: especialidad("esp-03").nombre,
    especialidadColor: especialidad("esp-03").color,
    fecha: fechaSemana(1),
    horaInicio: "08:30",
    horaFin: horaFin("08:30", 60),
    estado: EstadoCita.CONFIRMADA,
    motivoConsulta: "Tratamiento de conducto",
    creadoEn: new Date().toISOString(),
  },
  {
    id: "cita-04",
    paciente: PACIENTES[3],
    doctor: DOCTORES[3],
    especialidadId: "esp-04",
    especialidadNombre: especialidad("esp-04").nombre,
    especialidadColor: especialidad("esp-04").color,
    fecha: fechaSemana(1),
    horaInicio: "11:00",
    horaFin: horaFin("11:00", 45),
    estado: EstadoCita.PENDIENTE,
    creadoEn: new Date().toISOString(),
  },
  // ─── Miércoles ────────────────────────────────────────────────────────────
  {
    id: "cita-05",
    paciente: PACIENTES[4],
    doctor: DOCTORES[0],
    especialidadId: "esp-05",
    especialidadNombre: especialidad("esp-05").nombre,
    especialidadColor: especialidad("esp-05").color,
    fecha: fechaSemana(2),
    horaInicio: "09:30",
    horaFin: horaFin("09:30", 60),
    estado: EstadoCita.CONFIRMADA,
    motivoConsulta: "Blanqueamiento dental",
    creadoEn: new Date().toISOString(),
  },
  {
    id: "cita-06",
    paciente: PACIENTES[5],
    doctor: DOCTORES[1],
    especialidadId: "esp-02",
    especialidadNombre: especialidad("esp-02").nombre,
    especialidadColor: especialidad("esp-02").color,
    fecha: fechaSemana(2),
    horaInicio: "14:00",
    horaFin: horaFin("14:00", 30),
    estado: EstadoCita.CANCELADA,
    motivoCancelacion: "Paciente canceló por viaje",
    creadoEn: new Date().toISOString(),
  },
  // ─── Jueves ───────────────────────────────────────────────────────────────
  {
    id: "cita-07",
    paciente: PACIENTES[0],
    doctor: DOCTORES[2],
    especialidadId: "esp-06",
    especialidadNombre: especialidad("esp-06").nombre,
    especialidadColor: especialidad("esp-06").color,
    fecha: fechaSemana(3),
    horaInicio: "10:30",
    horaFin: horaFin("10:30", 90),
    estado: EstadoCita.CONFIRMADA,
    motivoConsulta: "Extracción muela del juicio",
    creadoEn: new Date().toISOString(),
  },
  // ─── Viernes ──────────────────────────────────────────────────────────────
  {
    id: "cita-08",
    paciente: PACIENTES[1],
    doctor: DOCTORES[4],
    especialidadId: "esp-05",
    especialidadNombre: especialidad("esp-05").nombre,
    especialidadColor: especialidad("esp-05").color,
    fecha: fechaSemana(4),
    horaInicio: "09:00",
    horaFin: horaFin("09:00", 60),
    estado: EstadoCita.PENDIENTE,
    creadoEn: new Date().toISOString(),
  },
  {
    id: "cita-09",
    paciente: PACIENTES[3],
    doctor: DOCTORES[3],
    especialidadId: "esp-01",
    especialidadNombre: especialidad("esp-01").nombre,
    especialidadColor: especialidad("esp-01").color,
    fecha: fechaSemana(4),
    horaInicio: "11:30",
    horaFin: horaFin("11:30", 45),
    estado: EstadoCita.NO_ASISTIO,
    creadoEn: new Date().toISOString(),
  },
  // ─── Hoy (extra) ──────────────────────────────────────────────────────────
  {
    id: "cita-10",
    paciente: PACIENTES[2],
    doctor: DOCTORES[0],
    especialidadId: "esp-01",
    especialidadNombre: especialidad("esp-01").nombre,
    especialidadColor: especialidad("esp-01").color,
    fecha: fecha(0),
    horaInicio: "16:00",
    horaFin: horaFin("16:00", 45),
    estado: EstadoCita.EN_CONSULTA,
    motivoConsulta: "Limpieza dental",
    creadoEn: new Date().toISOString(),
  },
];

// ─── Lista de espera ────────────────────────────────────────────────────────

export const LISTA_ESPERA_MOCK: ItemListaEspera[] = [
  {
    id: "esp-wait-01",
    paciente: PACIENTES[4],
    especialidadId: "esp-02",
    especialidadNombre: "Ortodoncia",
    doctorPreferidoId: "doc-02",
    fechaRegistro: fecha(-3),
    prioridad: PrioridadEspera.NORMAL,
    notas: "Prefiere horario de mañana",
  },
  {
    id: "esp-wait-02",
    paciente: PACIENTES[5],
    especialidadId: "esp-03",
    especialidadNombre: "Endodoncia",
    fechaRegistro: fecha(-1),
    prioridad: PrioridadEspera.ALTA,
    notas: "Dolor intenso, necesita atención urgente",
  },
];

// ─── Generador de slots disponibles ─────────────────────────────────────────

export function generarSlotsDelDia(
  doctorId: string,
  fecha: string,
  duracionMin: number,
  citasExistentes: Cita[]
): { horaInicio: string; horaFin: string; disponible: boolean }[] {
  const HORA_INICIO = 8 * 60;  // 08:00
  const HORA_FIN    = 19 * 60; // 19:00

  const slots = [];
  let cursor = HORA_INICIO;

  // Citas del doctor en esa fecha (solo activas)
  const citasDelDia = citasExistentes.filter(
    (c) =>
      c.doctor.id === doctorId &&
      c.fecha === fecha &&
      c.estado !== EstadoCita.CANCELADA &&
      c.estado !== EstadoCita.NO_ASISTIO
  );

  while (cursor + duracionMin <= HORA_FIN) {
    const horaIni = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
    const horaFn  = `${String(Math.floor((cursor + duracionMin) / 60)).padStart(2, "0")}:${String((cursor + duracionMin) % 60).padStart(2, "0")}`;

    // Verificar solapamiento con citas existentes
    const hayConflicto = citasDelDia.some((cita) => {
      const [ciH, ciM] = cita.horaInicio.split(":").map(Number);
      const [cfH, cfM] = cita.horaFin.split(":").map(Number);
      const ciMin = ciH * 60 + ciM;
      const cfMin = cfH * 60 + cfM;
      return cursor < cfMin && cursor + duracionMin > ciMin;
    });

    slots.push({ horaInicio: horaIni, horaFin: horaFn, disponible: !hayConflicto });
    cursor += 30; // saltos de 30 min
  }

  return slots;
}
