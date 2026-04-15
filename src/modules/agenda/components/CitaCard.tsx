"use client";

import { useState } from "react";
import { Clock, User, Stethoscope, CheckCircle2, Loader2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { type Cita, EstadoCita } from "../types/agenda.types";

// ─── Configuración visual por estado ──────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoCita, { label: string; clases: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  [EstadoCita.CONFIRMADA]:  { label: "Confirmada",  clases: "border-l-4 border-l-green-500  bg-green-50/60",   badgeVariant: "default" },
  [EstadoCita.PENDIENTE]:   { label: "Pendiente",   clases: "border-l-4 border-l-yellow-400 bg-yellow-50/60",  badgeVariant: "secondary" },
  [EstadoCita.EN_CONSULTA]: { label: "En consulta", clases: "border-l-4 border-l-blue-500   bg-blue-50/60",    badgeVariant: "default" },
  [EstadoCita.COMPLETADA]:  { label: "Completada",  clases: "border-l-4 border-l-gray-400   bg-gray-50/60",    badgeVariant: "secondary" },
  [EstadoCita.CANCELADA]:   { label: "Cancelada",   clases: "border-l-4 border-l-red-400    bg-red-50/60",     badgeVariant: "destructive" },
  [EstadoCita.NO_ASISTIO]:  { label: "No asistió",  clases: "border-l-4 border-l-slate-400  bg-slate-50/60",   badgeVariant: "outline" },
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface CitaCardProps {
  cita: Cita;
  marcandoAsistencia?: boolean;
  onMarcarAsistencia:  (citaId: string) => void;
  onReprogramar:       (cita: Cita) => void;
  onCancelar:          (cita: Cita) => void;
  compact?: boolean;   // versión compacta para vista de calendario
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function CitaCard({
  cita,
  marcandoAsistencia = false,
  onMarcarAsistencia,
  onReprogramar,
  onCancelar,
  compact = false,
}: CitaCardProps) {
  const config = ESTADO_CONFIG[cita.estado];
  const puedeActuar = cita.estado !== EstadoCita.CANCELADA && cita.estado !== EstadoCita.COMPLETADA;
  const puedeMarcarAsistencia = cita.estado === EstadoCita.CONFIRMADA || cita.estado === EstadoCita.EN_CONSULTA;

  if (compact) {
    return (
      <div
        className={cn(
          "rounded px-2 py-1 text-xs cursor-pointer hover:brightness-95 transition-all",
          config.clases,
          "overflow-hidden"
        )}
        title={`${cita.paciente.nombre} ${cita.paciente.apellido} — ${cita.horaInicio}`}
      >
        <p className="font-semibold truncate" style={{ color: cita.especialidadColor }}>
          {cita.horaInicio} {cita.paciente.nombre}
        </p>
        <p className="truncate text-muted-foreground">{cita.doctor.apellido}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 space-y-3 shadow-sm", config.clases)}>
      {/* Cabecera: hora + badge + menú */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: cita.especialidadColor }}
          />
          <span className="text-sm font-bold">
            {cita.horaInicio} – {cita.horaFin}
          </span>
          <Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
        </div>

        {/* Menú de acciones secundarias */}
        {puedeActuar && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReprogramar(cita)}>
                Reprogramar cita
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onCancelar(cita)}
              >
                Cancelar cita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Paciente */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">
          {cita.paciente.nombre} {cita.paciente.apellido}
        </span>
        <span className="text-xs text-muted-foreground">{cita.paciente.telefono}</span>
      </div>

      {/* Doctor + especialidad */}
      <div className="flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">
          Dr. {cita.doctor.nombre} {cita.doctor.apellido}
        </span>
        <span className="text-xs" style={{ color: cita.especialidadColor }}>
          · {cita.especialidadNombre}
        </span>
      </div>

      {/* Motivo (si existe) */}
      {cita.motivoConsulta && (
        <p className="text-xs text-muted-foreground italic">
          &ldquo;{cita.motivoConsulta}&rdquo;
        </p>
      )}

      {/* Motivo de cancelación */}
      {cita.estado === EstadoCita.CANCELADA && cita.motivoCancelacion && (
        <p className="text-xs text-destructive">
          Cancelada: {cita.motivoCancelacion}
        </p>
      )}

      {/* Botón marcar asistencia */}
      {puedeMarcarAsistencia && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs gap-1.5"
          disabled={marcandoAsistencia}
          onClick={() => onMarcarAsistencia(cita.id)}
        >
          {marcandoAsistencia ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          )}
          Marcar asistencia
        </Button>
      )}
    </div>
  );
}
