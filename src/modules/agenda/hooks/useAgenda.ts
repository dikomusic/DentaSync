"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type Cita,
  type FiltrosAgenda,
  type ItemListaEspera,
  type CrearCitaDto,
  type CancelarCitaDto,
  type ReprogramarCitaDto,
  type AgregarListaEsperaDto,
  EstadoCita,
  PrioridadEspera,
} from "../types/agenda.types";
import {
  CITAS_MOCK,
  DOCTORES,
  ESPECIALIDADES,
  PACIENTES,
  LISTA_ESPERA_MOCK,
  generarSlotsDelDia,
} from "../data/agenda.mock";

// ─── Hook principal: citas + acciones ──────────────────────────────────────

export function useCitas(filtros: FiltrosAgenda) {
  const [citas, setCitas] = useState<Cita[]>(CITAS_MOCK);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);

  // Filtrar citas según criterios
  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      if (filtros.doctorId && c.doctor.id !== filtros.doctorId) return false;
      if (filtros.especialidadId && c.especialidadId !== filtros.especialidadId) return false;
      if (filtros.fecha && c.fecha !== filtros.fecha) return false;
      return true;
    });
  }, [citas, filtros]);

  // Marcar asistencia — optimistic update
  const marcarAsistencia = useCallback(
    async (citaId: string) => {
      const estadoAnterior = citas.find((c) => c.id === citaId)?.estado;
      setAccionEnCurso(citaId);

      // Optimistic: marcar inmediatamente sin esperar API
      setCitas((prev) =>
        prev.map((c) =>
          c.id === citaId ? { ...c, estado: EstadoCita.COMPLETADA } : c
        )
      );

      try {
        // TODO: await apiClient.patch(`/citas/${citaId}`, { estado: EstadoCita.COMPLETADA })
        await new Promise((res) => setTimeout(res, 600)); // simular latencia
      } catch {
        // Revertir si la API falla
        setCitas((prev) =>
          prev.map((c) =>
            c.id === citaId ? { ...c, estado: estadoAnterior ?? EstadoCita.CONFIRMADA } : c
          )
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    [citas]
  );

  // Cancelar cita con motivo obligatorio
  const cancelarCita = useCallback(
    async (dto: CancelarCitaDto) => {
      setAccionEnCurso(dto.citaId);
      try {
        // TODO: await apiClient.patch(`/citas/${dto.citaId}/cancelar`, { motivo: dto.motivoCancelacion })
        await new Promise((res) => setTimeout(res, 400));
        setCitas((prev) =>
          prev.map((c) =>
            c.id === dto.citaId
              ? { ...c, estado: EstadoCita.CANCELADA, motivoCancelacion: dto.motivoCancelacion }
              : c
          )
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  // Reprogramar cita
  const reprogramarCita = useCallback(
    async (dto: ReprogramarCitaDto) => {
      setAccionEnCurso(dto.citaId);
      try {
        // TODO: await apiClient.patch(`/citas/${dto.citaId}/reprogramar`, dto)
        await new Promise((res) => setTimeout(res, 400));
        const esp = ESPECIALIDADES.find(
          (e) => e.id === citas.find((c) => c.id === dto.citaId)?.especialidadId
        );
        const duracion = esp?.duracionDefaultMin ?? 45;
        const [h, m] = dto.nuevaHora.split(":").map(Number);
        const finMin = h * 60 + m + duracion;
        const horaFin = `${String(Math.floor(finMin / 60)).padStart(2, "0")}:${String(finMin % 60).padStart(2, "0")}`;

        setCitas((prev) =>
          prev.map((c) =>
            c.id === dto.citaId
              ? { ...c, fecha: dto.nuevaFecha, horaInicio: dto.nuevaHora, horaFin, estado: EstadoCita.CONFIRMADA }
              : c
          )
        );
      } finally {
        setAccionEnCurso(null);
      }
    },
    [citas]
  );

  // Crear nueva cita
  const crearCita = useCallback(
    async (dto: CrearCitaDto) => {
      setAccionEnCurso("nueva");
      try {
        // TODO: await apiClient.post("/citas", dto)
        await new Promise((res) => setTimeout(res, 400));

        const doctor = DOCTORES.find((d) => d.id === dto.doctorId)!;
        const especialidad = ESPECIALIDADES.find((e) => e.id === dto.especialidadId)!;
        const paciente = PACIENTES.find((p) => p.id === dto.pacienteId)!;
        const [h, m] = dto.horaInicio.split(":").map(Number);
        const finMin = h * 60 + m + especialidad.duracionDefaultMin;
        const horaFin = `${String(Math.floor(finMin / 60)).padStart(2, "0")}:${String(finMin % 60).padStart(2, "0")}`;

        const nuevaCita: Cita = {
          id: `cita-${Date.now()}`,
          paciente,
          doctor,
          especialidadId:     especialidad.id,
          especialidadNombre: especialidad.nombre,
          especialidadColor:  especialidad.color,
          fecha:              dto.fecha,
          horaInicio:         dto.horaInicio,
          horaFin,
          estado:             EstadoCita.CONFIRMADA,
          motivoConsulta:     dto.motivoConsulta,
          notas:              dto.notas,
          creadoEn:           new Date().toISOString(),
        };

        setCitas((prev) => [...prev, nuevaCita]);
      } finally {
        setAccionEnCurso(null);
      }
    },
    []
  );

  return {
    citas: citasFiltradas,
    todasLasCitas: citas,
    accionEnCurso,
    marcarAsistencia,
    cancelarCita,
    reprogramarCita,
    crearCita,
  };
}

// ─── Hook: doctores por especialidad ──────────────────────────────────────

export function useDoctoresPorEspecialidad(especialidadId: string | undefined) {
  const doctores = useMemo(() => {
    if (!especialidadId) return [];
    return DOCTORES.filter(
      (d) => d.activo && d.especialidades.includes(especialidadId)
    );
  }, [especialidadId]);

  return { doctores };
}

// ─── Hook: slots disponibles ──────────────────────────────────────────────

export function useSlotsDisponibles(
  doctorId: string | undefined,
  fecha: string | undefined,
  especialidadId: string | undefined,
  todasLasCitas: Cita[]
) {
  const slots = useMemo(() => {
    if (!doctorId || !fecha || !especialidadId) return [];
    const esp = ESPECIALIDADES.find((e) => e.id === especialidadId);
    const duracion = esp?.duracionDefaultMin ?? 30;
    return generarSlotsDelDia(doctorId, fecha, duracion, todasLasCitas);
  }, [doctorId, fecha, especialidadId, todasLasCitas]);

  return { slots };
}

// ─── Hook: lista de espera ────────────────────────────────────────────────

export function useListaEspera() {
  const [listaEspera, setListaEspera] = useState<ItemListaEspera[]>(LISTA_ESPERA_MOCK);

  const agregar = useCallback(async (dto: AgregarListaEsperaDto) => {
    // TODO: await apiClient.post("/lista-espera", dto)
    await new Promise((res) => setTimeout(res, 300));

    const especialidad = ESPECIALIDADES.find((e) => e.id === dto.especialidadId)!;
    const paciente = PACIENTES.find((p) => p.id === dto.pacienteId)!;

    const nuevo: ItemListaEspera = {
      id: `wait-${Date.now()}`,
      paciente,
      especialidadId:     especialidad.id,
      especialidadNombre: especialidad.nombre,
      doctorPreferidoId:  dto.doctorPreferidoId,
      fechaRegistro:      new Date().toISOString().split("T")[0],
      prioridad:          dto.prioridad,
      notas:              dto.notas,
    };

    setListaEspera((prev) => [nuevo, ...prev]);
  }, []);

  const eliminar = useCallback(async (id: string) => {
    // TODO: await apiClient.delete(`/lista-espera/${id}`)
    await new Promise((res) => setTimeout(res, 200));
    setListaEspera((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { listaEspera, agregar, eliminar };
}

// ─── Exportar datos del catálogo ──────────────────────────────────────────

export { ESPECIALIDADES, DOCTORES, PACIENTES };
