"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
} from "../types/pacientes.types";

// ─── Helpers de fetch ─────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de red" })) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Hook principal ────────────────────────────────────────────────────────────

export function usePacientes(filtros: FiltrosPacientes) {
  const [pacientes, setPacientes]         = useState<Paciente[]>([]);
  const [cargando, setCargando]           = useState(true);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);

  // Carga inicial desde la API
  const cargarPacientes = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiFetch<Paciente[]>("/api/pacientes");
      setPacientes(data);
    } catch (err) {
      console.error("[usePacientes] Error al cargar:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargarPacientes(); }, [cargarPacientes]);

  // Filtrado local (los datos ya están en estado)
  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((p) => {
      if (filtros.estado        && p.estado         !== filtros.estado)        return false;
      if (filtros.clasificacion && p.clasificacion  !== filtros.clasificacion) return false;
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const coincide =
          p.nombre.toLowerCase().includes(q)   ||
          p.apellido.toLowerCase().includes(q) ||
          p.dni.includes(q)                    ||
          p.telefono.includes(q)               ||
          (p.email?.toLowerCase().includes(q) ?? false);
        if (!coincide) return false;
      }
      return true;
    });
  }, [pacientes, filtros]);

  // Verificar DNI duplicado (sobre el estado local)
  const verificarDni = useCallback(
    (dni: string, excludeId?: string): Paciente | null =>
      pacientes.find((p) => p.dni === dni && p.id !== excludeId) ?? null,
    [pacientes]
  );

  // ── Registrar ─────────────────────────────────────────────────────────────
  const registrarPaciente = useCallback(async (dto: RegistrarPacienteDto) => {
    setAccionEnCurso("registrar");
    try {
      const nuevo = await apiFetch<Paciente>("/api/pacientes", {
        method: "POST",
        body:   JSON.stringify(dto),
      });
      setPacientes((prev) => [nuevo, ...prev]);
      return nuevo;
    } finally {
      setAccionEnCurso(null);
    }
  }, []);

  // ── Editar ────────────────────────────────────────────────────────────────
  const editarPaciente = useCallback(
    async (pacienteId: string, dto: EditarPacienteDto, _modificadoPor: string) => {
      setAccionEnCurso(pacienteId);
      try {
        const actualizado = await apiFetch<Paciente>(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          body:   JSON.stringify(dto),
        });
        setPacientes((prev) => prev.map((p) => (p.id === pacienteId ? actualizado : p)));
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // ── Clasificar ────────────────────────────────────────────────────────────
  const clasificarPaciente = useCallback(
    async (dto: ClasificarPacienteDto, _modificadoPor: string) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        const actualizado = await apiFetch<Paciente>(
          `/api/pacientes/${dto.pacienteId}/clasificar`,
          {
            method: "PUT",
            body:   JSON.stringify({
              estado:        dto.estado,
              clasificacion: dto.clasificacion,
              motivo:        dto.motivo,
            }),
          }
        );
        setPacientes((prev) =>
          prev.map((p) => (p.id === dto.pacienteId ? actualizado : p))
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // ── Agregar alergia ───────────────────────────────────────────────────────
  const agregarAlergia = useCallback(
    async (dto: AgregarAlergiaDto, _registradoPor: string) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        const actualizado = await apiFetch<Paciente>(
          `/api/pacientes/${dto.pacienteId}/alergias`,
          {
            method: "POST",
            body:   JSON.stringify({
              sustancia:      dto.sustancia,
              severidad:      dto.severidad,
              reaccion:       dto.reaccion,
              fechaDeteccion: dto.fechaDeteccion,
            }),
          }
        );
        setPacientes((prev) =>
          prev.map((p) => (p.id === dto.pacienteId ? actualizado : p))
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // ── Agregar antecedente ───────────────────────────────────────────────────
  const agregarAntecedente = useCallback(async (dto: AgregarAntecedenteDto) => {
    setAccionEnCurso(dto.pacienteId);
    try {
      const actualizado = await apiFetch<Paciente>(
        `/api/pacientes/${dto.pacienteId}/antecedentes`,
        {
          method: "POST",
          body:   JSON.stringify({ tipo: dto.tipo, descripcion: dto.descripcion }),
        }
      );
      setPacientes((prev) =>
        prev.map((p) => (p.id === dto.pacienteId ? actualizado : p))
      );
    } finally {
      setAccionEnCurso(null);
    }
  }, []);

  // ── Guardar convenio ──────────────────────────────────────────────────────
  const guardarConvenio = useCallback(async (dto: ConvenioDto) => {
    setAccionEnCurso(dto.pacienteId);
    try {
      const actualizado = await apiFetch<Paciente>(
        `/api/pacientes/${dto.pacienteId}/convenio`,
        {
          method: "PUT",
          body:   JSON.stringify({
            tipo:                dto.tipo,
            nombreEntidad:       dto.nombreEntidad,
            numeroPoliza:        dto.numeroPoliza,
            porcentajeDescuento: dto.porcentajeDescuento,
            vigenciaDesde:       dto.vigenciaDesde,
            vigenciaHasta:       dto.vigenciaHasta,
          }),
        }
      );
      setPacientes((prev) =>
        prev.map((p) => (p.id === dto.pacienteId ? actualizado : p))
      );
    } finally {
      setAccionEnCurso(null);
    }
  }, []);

  // ── Guardar anamnesis ─────────────────────────────────────────────────────
  const guardarAnamnesis = useCallback(
    async (
      pacienteId: string,
      dto: { grupoSanguineo?: string; medicamentosActuales: string[]; notasAdicionales?: string }
    ) => {
      setAccionEnCurso(pacienteId);
      try {
        const actualizado = await apiFetch<Paciente>(
          `/api/pacientes/${pacienteId}/anamnesis`,
          { method: "PUT", body: JSON.stringify(dto) }
        );
        setPacientes((prev) =>
          prev.map((p) => (p.id === pacienteId ? actualizado : p))
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // ── Adjuntar documento ────────────────────────────────────────────────────
  const adjuntarDocumento = useCallback(
    async (dto: AdjuntarDocumentoDto, _subidoPor: string) => {
      setAccionEnCurso(dto.pacienteId);
      try {
        const actualizado = await apiFetch<Paciente>(
          `/api/pacientes/${dto.pacienteId}/documentos`,
          {
            method: "POST",
            body:   JSON.stringify({
              nombre:      dto.nombre,
              tipo:        dto.tipo,
              descripcion: dto.descripcion,
              tamanioKb:   dto.tamanioKb,
            }),
          }
        );
        setPacientes((prev) =>
          prev.map((p) => (p.id === dto.pacienteId ? actualizado : p))
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // ── Exportar ficha (cliente puro, sin cambios) ────────────────────────────
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
      paciente.email  ? `Email:        ${paciente.email}`  : "",
      paciente.ciudad ? `Ciudad:       ${paciente.ciudad}` : "",
      "",
      "ESTADO CLÍNICO",
      `Estado:          ${paciente.estado}`,
      `Clasificación:   ${paciente.clasificacion}`,
      `Total citas:     ${paciente.totalCitas}`,
      `Última cita:     ${paciente.ultimaCitaFecha ?? "Sin citas"}`,
      `Saldo pendiente: S/ ${paciente.saldoPendiente}`,
      "",
    ];

    if (paciente.antecedentes) {
      lineas.push("ANTECEDENTES MÉDICOS");
      if (paciente.antecedentes.grupoSanguineo)
        lineas.push(`Grupo sanguíneo: ${paciente.antecedentes.grupoSanguineo}`);
      paciente.antecedentes.antecedentes.forEach((a) =>
        lineas.push(`[${a.tipo}] ${a.descripcion}`)
      );
      lineas.push("", "ALERGIAS");
      if (paciente.antecedentes.alergias.length === 0) {
        lineas.push("Sin alergias registradas");
      } else {
        paciente.antecedentes.alergias.forEach((a) =>
          lineas.push(`⚠ ${a.sustancia} (${a.severidad}): ${a.reaccion}`)
        );
      }
      lineas.push("");
    }

    if (paciente.convenio?.activo) {
      lineas.push("CONVENIO");
      lineas.push(`Entidad:   ${paciente.convenio.nombreEntidad}`);
      lineas.push(`Descuento: ${paciente.convenio.porcentajeDescuento}%`);
      lineas.push(
        `Vigencia:  ${paciente.convenio.vigenciaDesde} → ${paciente.convenio.vigenciaHasta ?? "Sin vencimiento"}`
      );
      lineas.push("");
    }

    lineas.push(`Generado: ${new Date().toLocaleString("es-PE")}`);
    lineas.push("═══════════════════════════════════════════════════════");

    const blob = new Blob([lineas.filter(Boolean).join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `ficha_${paciente.apellido}_${paciente.nombre}_${paciente.dni}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total:    pacientes.length,
      activos:  pacientes.filter((p) => p.estado === EstadoPaciente.ACTIVO).length,
      morosos:  pacientes.filter((p) => p.estado === EstadoPaciente.MOROSO).length,
      convenio: pacientes.filter((p) => p.convenio?.activo).length,
    }),
    [pacientes]
  );

  return {
    pacientes:      pacientesFiltrados,
    todosPacientes: pacientes,
    cargando,
    accionEnCurso,
    stats,
    verificarDni,
    registrarPaciente,
    editarPaciente,
    clasificarPaciente,
    agregarAlergia,
    agregarAntecedente,
    guardarAnamnesis,
    guardarConvenio,
    adjuntarDocumento,
    exportarFicha,
  };
}
