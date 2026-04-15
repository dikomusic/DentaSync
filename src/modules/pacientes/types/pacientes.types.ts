// ─── Enums ─────────────────────────────────────────────────────────────────

export enum EstadoPaciente {
  ACTIVO     = "ACTIVO",
  INACTIVO   = "INACTIVO",
  MOROSO     = "MOROSO",
  SUSPENDIDO = "SUSPENDIDO",
}

export enum ClasificacionPaciente {
  NUEVO    = "NUEVO",
  REGULAR  = "REGULAR",
  VIP      = "VIP",
  CONVENIO = "CONVENIO",
}

export enum SeveridadAlergia {
  LEVE     = "LEVE",
  MODERADA = "MODERADA",
  GRAVE    = "GRAVE",
}

export enum TipoAntecedente {
  ENFERMEDAD  = "ENFERMEDAD",
  CIRUGIA     = "CIRUGIA",
  MEDICAMENTO = "MEDICAMENTO",
  FAMILIAR    = "FAMILIAR",
}

export enum TipoDocumento {
  RADIOGRAFIA     = "RADIOGRAFIA",
  RECETA          = "RECETA",
  INFORME_MEDICO  = "INFORME_MEDICO",
  CONSENTIMIENTO  = "CONSENTIMIENTO",
  PRESUPUESTO     = "PRESUPUESTO",
  OTRO            = "OTRO",
}

export enum TipoConvenio {
  EMPRESA      = "EMPRESA",
  ASEGURADORA  = "ASEGURADORA",
  MUTUAL       = "MUTUAL",
  OBRA_SOCIAL  = "OBRA_SOCIAL",
}

// ─── Sub-entidades ─────────────────────────────────────────────────────────

export interface Alergia {
  id: string;
  sustancia:       string;
  severidad:       SeveridadAlergia;
  reaccion:        string;
  fechaDeteccion:  string; // "YYYY-MM-DD"
  registradoPor:   string;
}

export interface Antecedente {
  id:            string;
  tipo:          TipoAntecedente;
  descripcion:   string;
  fechaRegistro: string;
  activo:        boolean;
}

export interface AntecedentesMedicos {
  grupoSanguineo?:      string;
  antecedentes:         Antecedente[];
  alergias:             Alergia[];
  medicamentosActuales: string[];
  notasAdicionales?:    string;
  actualizadoEn:        string;
}

export interface Convenio {
  id:                  string;
  tipo:                TipoConvenio;
  nombreEntidad:       string;
  numeroPoliza?:       string;
  porcentajeDescuento: number; // 0–100
  vigenciaDesde:       string;
  vigenciaHasta?:      string;
  activo:              boolean;
}

export interface DocumentoPaciente {
  id:           string;
  nombre:       string;
  tipo:         TipoDocumento;
  descripcion?: string;
  tamanioKb:    number;
  subidoEn:     string;
  subidoPor:    string;
}

export interface CambioPerfil {
  id:            string;
  campo:         string;
  valorAnterior: string;
  valorNuevo:    string;
  modificadoPor: string;
  modificadoEn:  string;
}

// ─── Entidad principal ────────────────────────────────────────────────────

export interface Paciente {
  id: string;
  // Datos personales
  nombre:               string;
  apellido:             string;
  dni:                  string; // único por tenant
  fechaNacimiento:      string; // "YYYY-MM-DD"
  genero:               "M" | "F" | "OTRO";
  // Contacto
  telefono:             string;
  telefonoEmergencia?:  string;
  email?:               string;
  direccion?:           string;
  ciudad?:              string;
  // Clasificación
  estado:               EstadoPaciente;
  clasificacion:        ClasificacionPaciente;
  motivoEstado?:        string;
  // Clínico
  antecedentes?:        AntecedentesMedicos;
  convenio?:            Convenio;
  documentos:           DocumentoPaciente[];
  historialCambios:     CambioPerfil[];
  // Resumen
  primeraCitaFecha?:    string;
  ultimaCitaFecha?:     string;
  totalCitas:           number;
  saldoPendiente:       number;
  // Meta
  creadoEn:             string;
  actualizadoEn:        string;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────

export interface RegistrarPacienteDto {
  nombre:               string;
  apellido:             string;
  dni:                  string;
  fechaNacimiento:      string;
  genero:               "M" | "F" | "OTRO";
  telefono:             string;
  telefonoEmergencia?:  string;
  email?:               string;
  direccion?:           string;
  ciudad?:              string;
}

export type EditarPacienteDto = Partial<RegistrarPacienteDto>;

export interface ClasificarPacienteDto {
  pacienteId:    string;
  estado:        EstadoPaciente;
  clasificacion: ClasificacionPaciente;
  motivo?:       string;
}

export interface AgregarAlergiaDto {
  pacienteId:     string;
  sustancia:      string;
  severidad:      SeveridadAlergia;
  reaccion:       string;
  fechaDeteccion: string;
}

export interface AgregarAntecedenteDto {
  pacienteId:  string;
  tipo:        TipoAntecedente;
  descripcion: string;
}

export interface ConvenioDto {
  pacienteId:          string;
  tipo:                TipoConvenio;
  nombreEntidad:       string;
  numeroPoliza?:       string;
  porcentajeDescuento: number;
  vigenciaDesde:       string;
  vigenciaHasta?:      string;
}

export interface AdjuntarDocumentoDto {
  pacienteId:   string;
  nombre:       string;
  tipo:         TipoDocumento;
  descripcion?: string;
  tamanioKb:    number;
}

// ─── Filtros ───────────────────────────────────────────────────────────────

export interface FiltrosPacientes {
  busqueda?:      string;
  estado?:        EstadoPaciente | "";
  clasificacion?: ClasificacionPaciente | "";
}
