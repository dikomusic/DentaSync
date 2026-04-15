"use client";

import { useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Cita, EstadoCita } from "../types/agenda.types";
import { CitaCard } from "./CitaCard";

// ─── Horas del consultorio ────────────────────────────────────────────────

const HORAS = Array.from({ length: 23 }, (_, i) => {
  const totalMin = 8 * 60 + i * 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}); // "08:00" … "19:00"

// ─── Props ────────────────────────────────────────────────────────────────

interface CalendarioVistaProps {
  citas:              Cita[];
  fechaActiva:        Date;
  vista:              "dia" | "semana" | "lista";
  accionEnCurso:      string | null;
  onCambiarVista:     (v: "dia" | "semana" | "lista") => void;
  onNuevaEnSlot?:     (fecha: string, hora: string) => void;
  onMarcarAsistencia: (id: string) => void;
  onReprogramar:      (cita: Cita) => void;
  onCancelar:         (cita: Cita) => void;
}

// ─── Vista diaria ─────────────────────────────────────────────────────────

function VistaDia({
  citas, fecha, accionEnCurso, onNuevaEnSlot, onMarcarAsistencia, onReprogramar, onCancelar,
}: {
  citas: Cita[];
  fecha: Date;
  accionEnCurso: string | null;
  onNuevaEnSlot?: (fecha: string, hora: string) => void;
  onMarcarAsistencia: (id: string) => void;
  onReprogramar: (cita: Cita) => void;
  onCancelar: (cita: Cita) => void;
}) {
  const fechaStr = format(fecha, "yyyy-MM-dd");
  const citasDelDia = citas.filter((c) => c.fecha === fechaStr);

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-1 pr-4">
        {HORAS.map((hora) => {
          const citasEnHora = citasDelDia.filter((c) => c.horaInicio === hora);
          const tieneActivas = citasEnHora.some(
            (c) => c.estado !== EstadoCita.CANCELADA
          );

          return (
            <div key={hora} className="flex gap-3 min-h-[3rem]">
              {/* Etiqueta de hora */}
              <div className="w-14 shrink-0 pt-2 text-right">
                <span className="text-xs text-muted-foreground">{hora}</span>
              </div>

              {/* Línea divisora */}
              <div className="w-px bg-border shrink-0 mt-2" />

              {/* Slot de hora */}
              <div
                className={cn(
                  "flex-1 py-1 rounded-md transition-colors min-h-[3rem]",
                  !tieneActivas && onNuevaEnSlot && "cursor-pointer hover:bg-accent/50"
                )}
                onClick={() => {
                  if (!tieneActivas && onNuevaEnSlot) {
                    onNuevaEnSlot(fechaStr, hora);
                  }
                }}
              >
                {citasEnHora.length === 0 && (
                  <div className="h-full flex items-center px-2">
                    <span className="text-xs text-muted-foreground/40 select-none">
                      Click para agendar
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {citasEnHora.map((cita) => (
                    <CitaCard
                      key={cita.id}
                      cita={cita}
                      marcandoAsistencia={accionEnCurso === cita.id}
                      onMarcarAsistencia={onMarcarAsistencia}
                      onReprogramar={onReprogramar}
                      onCancelar={onCancelar}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ─── Vista semanal ────────────────────────────────────────────────────────

function VistaSemana({
  citas, semanaInicio, accionEnCurso, onNuevaEnSlot, onMarcarAsistencia, onReprogramar, onCancelar,
}: {
  citas: Cita[];
  semanaInicio: Date;
  accionEnCurso: string | null;
  onNuevaEnSlot?: (fecha: string, hora: string) => void;
  onMarcarAsistencia: (id: string) => void;
  onReprogramar: (cita: Cita) => void;
  onCancelar: (cita: Cita) => void;
}) {
  const dias = Array.from({ length: 6 }, (_, i) => addDays(semanaInicio, i)); // Lun–Sáb

  return (
    <ScrollArea className="h-[600px]">
      <div className="pr-4">
        {/* Cabecera de días */}
        <div className="grid grid-cols-[3.5rem_1fr_1fr_1fr_1fr_1fr_1fr] gap-1 sticky top-0 bg-background z-10 pb-2 border-b mb-2">
          <div />
          {dias.map((dia) => {
            const esHoy = isSameDay(dia, new Date());
            return (
              <div key={dia.toISOString()} className="text-center">
                <p className="text-xs text-muted-foreground uppercase">
                  {format(dia, "EEE", { locale: es })}
                </p>
                <div className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                  esHoy ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {format(dia, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filas de horas */}
        {HORAS.map((hora) => (
          <div key={hora} className="grid grid-cols-[3.5rem_1fr_1fr_1fr_1fr_1fr_1fr] gap-1 min-h-[4rem] border-b border-border/40">
            <div className="text-right pt-1">
              <span className="text-xs text-muted-foreground">{hora}</span>
            </div>
            {dias.map((dia) => {
              const fechaStr = format(dia, "yyyy-MM-dd");
              const citasEnSlot = citas.filter(
                (c) => c.fecha === fechaStr && c.horaInicio === hora
              );
              return (
                <div
                  key={dia.toISOString()}
                  className={cn(
                    "p-0.5 space-y-0.5 rounded min-h-[4rem]",
                    citasEnSlot.length === 0 && onNuevaEnSlot && "cursor-pointer hover:bg-accent/30"
                  )}
                  onClick={() => {
                    if (citasEnSlot.length === 0 && onNuevaEnSlot) {
                      onNuevaEnSlot(fechaStr, hora);
                    }
                  }}
                >
                  {citasEnSlot.map((cita) => (
                    <CitaCard
                      key={cita.id}
                      cita={cita}
                      compact
                      marcandoAsistencia={accionEnCurso === cita.id}
                      onMarcarAsistencia={onMarcarAsistencia}
                      onReprogramar={onReprogramar}
                      onCancelar={onCancelar}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ─── Vista lista ──────────────────────────────────────────────────────────

function VistaLista({
  citas, accionEnCurso, onMarcarAsistencia, onReprogramar, onCancelar,
}: {
  citas: Cita[];
  accionEnCurso: string | null;
  onMarcarAsistencia: (id: string) => void;
  onReprogramar: (cita: Cita) => void;
  onCancelar: (cita: Cita) => void;
}) {
  // Agrupar citas por fecha
  const citasPorFecha = useMemo(() => {
    const mapa = new Map<string, Cita[]>();
    const ordenadas = [...citas].sort((a, b) =>
      a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio)
    );
    for (const cita of ordenadas) {
      if (!mapa.has(cita.fecha)) mapa.set(cita.fecha, []);
      mapa.get(cita.fecha)!.push(cita);
    }
    return mapa;
  }, [citas]);

  if (citasPorFecha.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Sin citas</p>
        <p className="text-sm">No hay citas para los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6 pr-4">
        {Array.from(citasPorFecha.entries()).map(([fecha, citasDia]) => (
          <div key={fecha}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold capitalize">
                {format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })}
              </h3>
              <Badge variant="secondary">{citasDia.length} citas</Badge>
            </div>
            <div className="space-y-2">
              {citasDia.map((cita) => (
                <CitaCard
                  key={cita.id}
                  cita={cita}
                  marcandoAsistencia={accionEnCurso === cita.id}
                  onMarcarAsistencia={onMarcarAsistencia}
                  onReprogramar={onReprogramar}
                  onCancelar={onCancelar}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────

export function CalendarioVista({
  citas,
  fechaActiva,
  vista,
  accionEnCurso,
  onCambiarVista,
  onNuevaEnSlot,
  onMarcarAsistencia,
  onReprogramar,
  onCancelar,
}: CalendarioVistaProps) {
  const semanaInicio = startOfWeek(fechaActiva, { weekStartsOn: 1 });

  return (
    <div className="space-y-3">
      {/* Toggle de vista */}
      <Tabs value={vista} onValueChange={(v) => onCambiarVista(v as typeof vista)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="dia">Día</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Contenido según vista */}
      {vista === "dia" && (
        <VistaDia
          citas={citas}
          fecha={fechaActiva}
          accionEnCurso={accionEnCurso}
          onNuevaEnSlot={onNuevaEnSlot}
          onMarcarAsistencia={onMarcarAsistencia}
          onReprogramar={onReprogramar}
          onCancelar={onCancelar}
        />
      )}
      {vista === "semana" && (
        <VistaSemana
          citas={citas}
          semanaInicio={semanaInicio}
          accionEnCurso={accionEnCurso}
          onNuevaEnSlot={onNuevaEnSlot}
          onMarcarAsistencia={onMarcarAsistencia}
          onReprogramar={onReprogramar}
          onCancelar={onCancelar}
        />
      )}
      {vista === "lista" && (
        <VistaLista
          citas={citas}
          accionEnCurso={accionEnCurso}
          onMarcarAsistencia={onMarcarAsistencia}
          onReprogramar={onReprogramar}
          onCancelar={onCancelar}
        />
      )}
    </div>
  );
}
