"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type Paciente,
  type FiltrosPacientes,
  type RegistrarPacienteDto,
  type EditarPacienteDto,
  type ClasificarPacienteDto,
  type AgregarAlergiaDto,
  type AgregarAntecedenteDto,
  type ConvenioDto,
  type AdjuntarDocumentoDto,
  EstadoPaciente,
  ClasificacionPaciente,
} from "../types/pacientes.types";
import { PACIENTES_MOCK } from "../data/pacientes.mock";

// ─── Hook principal ────────────────────────────────────────────────────────

export function usePacientes(filtros: FiltrosPacientes) {
  const [pacientes, setPacientes] = useState<Paciente[]>(PACIENTES_MOCK);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);

  // Filtrar pacientes según criterios
  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((p) => {
      if (filtros.estado && p.estado !== filtros.estado) return false;
      if (filtros.clasificacion && p.clasificacion !== filtros.clasificacion) return false;

      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const coincide =
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.dni.includes(q) ||
          p.telefono.includes(q) ||
          (p.email?.toLowerCase().includes(q) ?? false);
        if (!coincide) return false;
      }

      return true;
    });
  }, [pacientes, filtros]);

  // Verificar si existe un paciente con ese DNI (para evitar duplicados)
  const verificarDni = useCallback(
    (dni: string, excludeId?: string): Paciente | null => {
      return (
        pacientes.find((p) => p.dni === dni && p.id !== excludeId) ?? null
      );
    },
    [pacientes]
  );

  // Registrar nuevo paciente
  const registrarPaciente = useCallback(
    async (dto: RegistrarPacienteDto) => {
      setAccionEnCurso("registrar");
      try {
        // TODO: await apiClient.post("/pacientes", dto)
        await new Promise((r) => setTimeout(r, 400));
        const nuevo: Paciente = {
          id: `pac-${Date.now()}`,
          ...dto,
          estado: EstadoPaciente.ACTIVO,
          clasificacion: ClasificacionPaciente.NUEVO,
          documentos: [],
          historialCambios: [],
          totalCitas: 0,
          saldoPendiente: 0,
          creadoEn: new Date().toISOString().split("T")[0],
          actualizadoEn: new Date().toISOString().split("T")[0],
        };
        setPacientes((prev) => [nuevo, ...prev]);
        return nuevo;
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Editar datos del paciente — registra historial de cambios
  const editarPaciente = useCallback(
    async (pacienteId: string, dto: EditarPacienteDto, modificadoPor: string) => {
      setAccionEnCurso(pacienteId);
      try {
        // TODO: await apiClient.patch(`/pacientes/${pacienteId}`, dto)
        await new Promise((r) => setTimeout(r, 400));
        setPacientes((prev) =>
          prev.map((p) => {
            if (p.id !== pacienteId) return p;

            // Calcular cambios para el historial
            const cambios = Object.entries(dto)
              .filter(([campo, valor]) => valor !== undefined && String((p as Record<string, unknown>)[campo]) !== String(valor))
              .map(([campo, valor]) => ({
                id: `hc-${Date.now()}-${campo}`,
                campo,
                valorAnterior: String((p as Record<string, unknown>)[campo] ?? ""),
                valorNuevo: String(valor),
                modificadoPor,
                modificadoEn: new Date().toISOString(),
              }));

            return {
              ...p,
              ...dto,
              historialCambios: [...(p.historialCambios ?? []), ...cambios],
              actualizadoEn: new Date().toISOString().split("T")[0],
            };
          })
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Clasificar paciente (estado + clasificación)
  const clasificarPaciente = useCallback(
    async (dto: ClasificarPacienteDto, modificadoPor: string) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        // TODO: await apiClient.patch(`/pacientes/${dto.pacienteId}/clasificar`, dto)
        await new Promise((r) => setTimeout(r, 400));
        setPacientes((prev) =>
          prev.map((p) => {
            if (p.id !== dto.pacienteId) return p;
            const cambio = {
              id: `hc-${Date.now()}`,
              campo: "Estado",
              valorAnterior: `${p.estado} / ${p.clasificacion}`,
              valorNuevo: `${dto.estado} / ${dto.clasificacion}`,
              modificadoPor,
              modificadoEn: new Date().toISOString(),
            };
            return {
              ...p,
              estado: dto.estado,
              clasificacion: dto.clasificacion,
              motivoEstado: dto.motivo,
              historialCambios: [...(p.historialCambios ?? []), cambio],
              actualizadoEn: new Date().toISOString().split("T")[0],
            };
          })
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Agregar alergia
  const agregarAlergia = useCallback(
    async (dto: AgregarAlergiaDto, registradoPor: string) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        await new Promise((r) => setTimeout(r, 300));
        setPacientes((prev) =>
          prev.map((p) => {
            if (p.id !== dto.pacienteId) return p;
            const nuevaAlergia = {
              id: `alg-${Date.now()}`,
              sustancia: dto.sustancia,
              severidad: dto.severidad,
              reaccion: dto.reaccion,
              fechaDeteccion: dto.fechaDeteccion,
              registradoPor,
            };
            return {
              ...p,
              antecedentes: {
                ...(p.antecedentes ?? { antecedentes: [], medicamentosActuales: [], actualizadoEn: "" }),
                alergias: [...(p.antecedentes?.alergias ?? []), nuevaAlergia],
                actualizadoEn: new Date().toISOString().split("T")[0],
              },
            };
          })
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Agregar antecedente
  const agregarAntecedente = useCallback(
    async (dto: AgregarAntecedenteDto) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        await new Promise((r) => setTimeout(r, 300));
        setPacientes((prev) =>
          prev.map((p) => {
            if (p.id !== dto.pacienteId) return p;
            const nuevo = {
              id: `ant-${Date.now()}`,
              tipo: dto.tipo,
              descripcion: dto.descripcion,
              fechaRegistro: new Date().toISOString().split("T")[0],
              activo: true,
            };
            return {
              ...p,
              antecedentes: {
                ...(p.antecedentes ?? { alergias: [], medicamentosActuales: [], actualizadoEn: "" }),
                antecedentes: [...(p.antecedentes?.antecedentes ?? []), nuevo],
                actualizadoEn: new Date().toISOString().split("T")[0],
              },
            };
          })
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Gestionar convenio
  const guardarConvenio = useCallback(
    async (dto: ConvenioDto) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        await new Promise((r) => setTimeout(r, 400));
        setPacientes((prev) =>
          prev.map((p) => {
            if (p.id !== dto.pacienteId) return p;
            return {
              ...p,
              convenio: {
                id: p.convenio?.id ?? `conv-${Date.now()}`,
                tipo: dto.tipo,
                nombreEntidad: dto.nombreEntidad,
                numeroPoliza: dto.numeroPoliza,
                porcentajeDescuento: dto.porcentajeDescuento,
                vigenciaDesde: dto.vigenciaDesde,
                vigenciaHasta: dto.vigenciaHasta,
                activo: true,
              },
              clasificacion: ClasificacionPaciente.CONVENIO,
              actualizadoEn: new Date().toISOString().split("T")[0],
            };
          })
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Adjuntar documento
  const adjuntarDocumento = useCallback(
    async (dto: AdjuntarDocumentoDto, subidoPor: string) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        await new Promise((r) => setTimeout(r, 500));
        setPacientes((prev) =>
          prev.map((p) => {
            if (p.id !== dto.pacienteId) return p;
            const doc = {
              id: `doc-${Date.now()}`,
              nombre: dto.nombre,
              tipo: dto.tipo,
              descripcion: dto.descripcion,
              tamanioKb: dto.tamanioKb,
              subidoEn: new Date().toISOString().split("T")[0],
              subidoPor,
            };
            return { ...p, documentos: [...p.documentos, doc] };
          })
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Exportar ficha del paciente como texto
  const exportarFicha = useCallback((paciente: Paciente) => {
    const lineas = [
      "═══════════════════════════════════════════════════════",
      "                 FICHA DE PACIENTE — DentaSync          ",
      "═══════════════════════════════════════════════════════",
      "",
      "DATOS PERSONALES",
      `Nombre:       ${paciente.nombre} ${paciente.apellido}`,
      `DNI:          ${paciente.dni}`,
      `Nacimiento:   ${paciente.fechaNacimiento} (Género: ${paciente.genero})`,
      `Teléfono:     ${paciente.telefono}`,
      paciente.email ? `Email:        ${paciente.email}` : "",
      paciente.ciudad ? `Ciudad:       ${paciente.ciudad}` : "",
      "",
      "ESTADO CLÍNICO",
      `Estado:       ${paciente.estado}`,
      `Clasificación: ${paciente.clasificacion}`,
      `Total citas:  ${paciente.totalCitas}`,
      `Última cita:  ${paciente.ultimaCitaFecha ?? "Sin citas"}`,
      `Saldo pendiente: S/ ${paciente.saldoPendiente}`,
      "",
    ];

    if (paciente.antecedentes) {
      lineas.push("ANTECEDENTES MÉDICOS");
      if (paciente.antecedentes.grupoSanguineo) {
        lineas.push(`Grupo sanguíneo: ${paciente.antecedentes.grupoSanguineo}`);
      }
      paciente.antecedentes.antecedentes.forEach((a) => {
        lineas.push(`[${a.tipo}] ${a.descripcion}`);
      });
      lineas.push("");
      lineas.push("ALERGIAS");
      if (paciente.antecedentes.alergias.length === 0) {
        lineas.push("Sin alergias registradas");
      } else {
        paciente.antecedentes.alergias.forEach((a) => {
          lineas.push(`⚠ ${a.sustancia} (${a.severidad}): ${a.reaccion}`);
        });
      }
      lineas.push("");
    }

    if (paciente.convenio?.activo) {
      lineas.push("CONVENIO");
      lineas.push(`Entidad: ${paciente.convenio.nombreEntidad}`);
      lineas.push(`Descuento: ${paciente.convenio.porcentajeDescuento}%`);
      lineas.push(`Vigencia: ${paciente.convenio.vigenciaDesde} → ${paciente.convenio.vigenciaHasta ?? "Sin vencimiento"}`);
      lineas.push("");
    }

    lineas.push(`Generado: ${new Date().toLocaleString("es-PE")}`);
    lineas.push("═══════════════════════════════════════════════════════");

    const blob = new Blob([lineas.filter((l) => l !== null).join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${paciente.apellido}_${paciente.nombre}_${paciente.dni}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Estadísticas rápidas
  const stats = useMemo(() => ({
    total:     pacientes.length,
    activos:   pacientes.filter((p) => p.estado === EstadoPaciente.ACTIVO).length,
    morosos:   pacientes.filter((p) => p.estado === EstadoPaciente.MOROSO).length,
    convenio:  pacientes.filter((p) => p.convenio?.activo).length,
  }), [pacientes]);

  return {
    pacientes: pacientesFiltrados,
    todosPacientes: pacientes,
    accionEnCurso,
    stats,
    verificarDni,
    registrarPaciente,
    editarPaciente,
    clasificarPaciente,
    agregarAlergia,
    agregarAntecedente,
    guardarConvenio,
    adjuntarDocumento,
    exportarFicha,
  };
}
