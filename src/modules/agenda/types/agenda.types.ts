// ─── Enums ─────────────────────────────────────────────────────────────────

export enum EstadoCita {
  PENDIENTE    = "PENDIENTE",
  CONFIRMADA   = "CONFIRMADA",
  EN_CONSULTA  = "EN_CONSULTA",
  COMPLETADA   = "COMPLETADA",
  CANCELADA    = "CANCELADA",
  NO_ASISTIO   = "NO_ASISTIO",
}

export enum PrioridadEspera {
  ALTA   = "ALTA",
  NORMAL = "NORMAL",
  BAJA   = "BAJA",
}

// ─── Especialidad ──────────────────────────────────────────────────────────

export interface Especialidad {
  id: string;
  nombre: string;
  duracionDefaultMin: number; // duración por defecto en minutos
  color: string;              // color hex para identificación visual
}

// ─── Doctor ────────────────────────────────────────────────────────────────

export interface DoctorAgenda {
  id: string;
  nombre: string;
  apellido: string;
  especialidades: string[]; // array de Especialidad.id
  avatarUrl?: string;
  activo: boolean;
}

// ─── Paciente ──────────────────────────────────────────────────────────────

export interface PacienteResumen {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
}

// ─── Slot de tiempo ────────────────────────────────────────────────────────

export interface SlotDisponible {
  horaInicio: string; // "HH:mm"
  horaFin:    string;
  disponible: boolean;
}

// ─── Cita ──────────────────────────────────────────────────────────────────

export interface Cita {
  id: string;
  paciente:           PacienteResumen;
  doctor:             DoctorAgenda;
  especialidadId:     string;
  especialidadNombre: string;
  especialidadColor:  string;
  fecha:              string; // "YYYY-MM-DD"
  horaInicio:         string; // "HH:mm"
  horaFin:            string; // "HH:mm"
  estado:             EstadoCita;
  motivoConsulta?:    string;
  motivoCancelacion?: string;
  notas?:             string;
  creadoEn:           string;
}

// ─── Lista de espera ───────────────────────────────────────────────────────

export interface ItemListaEspera {
  id: string;
  paciente:             PacienteResumen;
  especialidadId:       string;
  especialidadNombre:   string;
  doctorPreferidoId?:   string;
  fechaRegistro:        string;
  prioridad:            PrioridadEspera;
  notas?:               string;
}

// ─── Filtros ────────────────────────────────────────────────────────────────

export interface FiltrosAgenda {
  doctorId?:      string;
  especialidadId?: string;
  fecha?:         string; // "YYYY-MM-DD"
}

// ─── DTOs de acciones ──────────────────────────────────────────────────────

export interface CrearCitaDto {
  especialidadId:  string;
  doctorId:        string;
  pacienteId:      string;
  fecha:           string;
  horaInicio:      string;
  motivoConsulta?: string;
  notas?:          string;
}

export interface CancelarCitaDto {
  citaId:            string;
  motivoCancelacion: string;
}

export interface ReprogramarCitaDto {
  citaId:     string;
  nuevaFecha: string;
  nuevaHora:  string;
}

export interface AgregarListaEsperaDto {
  pacienteId:          string;
  especialidadId:      string;
  doctorPreferidoId?:  string;
  prioridad:           PrioridadEspera;
  notas?:              string;
}
