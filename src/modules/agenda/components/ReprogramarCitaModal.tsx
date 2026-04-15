"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Cita } from "../types/agenda.types";
import { useSlotsDisponibles } from "../hooks/useAgenda";

interface ReprogramarCitaModalProps {
  cita:          Cita | null;
  todasLasCitas: Cita[];
  abierto:       boolean;
  onCerrar:      () => void;
  onConfirmar:   (citaId: string, nuevaFecha: string, nuevaHora: string) => Promise<void>;
}

export function ReprogramarCitaModal({
  cita,
  todasLasCitas,
  abierto,
  onCerrar,
  onConfirmar,
}: ReprogramarCitaModalProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>();
  const [horaSeleccionada, setHoraSeleccionada]   = useState<string | null>(null);
  const [cargando, setCargando]                   = useState(false);
  const [popoverAbierto, setPopoverAbierto]       = useState(false);

  const fechaStr = fechaSeleccionada ? format(fechaSeleccionada, "yyyy-MM-dd") : undefined;

  const { slots } = useSlotsDisponibles(
    cita?.doctor.id,
    fechaStr,
    cita?.especialidadId,
    todasLasCitas
  );

  const slotsDisponibles = slots.filter((s) => s.disponible);

  async function handleConfirmar() {
    if (!cita || !fechaStr || !horaSeleccionada) return;
    setCargando(true);
    try {
      await onConfirmar(cita.id, fechaStr, horaSeleccionada);
      handleCerrar();
    } finally {
      setCargando(false);
    }
  }

  function handleCerrar() {
    if (cargando) return;
    setFechaSeleccionada(undefined);
    setHoraSeleccionada(null);
    onCerrar();
  }

  const puedeConfirmar = !!fechaSeleccionada && !!horaSeleccionada;

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reprogramar cita</DialogTitle>
          <DialogDescription>
            Selecciona la nueva fecha y hora para el paciente.
          </DialogDescription>
        </DialogHeader>

        {/* Info de la cita actual */}
        {cita && (
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium">
              {cita.paciente.nombre} {cita.paciente.apellido}
            </p>
            <p className="text-muted-foreground">
              Fecha actual: {cita.fecha} · {cita.horaInicio}
            </p>
            <p className="text-muted-foreground">
              Dr. {cita.doctor.nombre} {cita.doctor.apellido} · {cita.especialidadNombre}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Selector de fecha */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Nueva fecha</p>
            <Popover open={popoverAbierto} onOpenChange={setPopoverAbierto}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaSeleccionada && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaSeleccionada
                    ? format(fechaSeleccionada, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaSeleccionada}
                  onSelect={(d) => {
                    setFechaSeleccionada(d);
                    setHoraSeleccionada(null);
                    setPopoverAbierto(false);
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Slots disponibles */}
          {fechaSeleccionada && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Horarios disponibles
                <span className="ml-1 text-muted-foreground font-normal">
                  ({slotsDisponibles.length} disponibles)
                </span>
              </p>
              {slotsDisponibles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : (
                <ScrollArea className="h-40">
                  <div className="grid grid-cols-3 gap-2 pr-4">
                    {slotsDisponibles.map((slot) => (
                      <button
                        key={slot.horaInicio}
                        type="button"
                        onClick={() => setHoraSeleccionada(slot.horaInicio)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                          horaSeleccionada === slot.horaInicio
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent"
                        )}
                      >
                        {slot.horaInicio}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Resumen nueva cita */}
          {puedeConfirmar && (
            <div className="flex items-center gap-2 rounded-md bg-primary/5 p-3 text-sm">
              <Badge variant="outline" className="shrink-0">Nueva fecha</Badge>
              <span>
                {format(fechaSeleccionada!, "PPP", { locale: es })} a las{" "}
                <strong>{horaSeleccionada}</strong>
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={!puedeConfirmar || cargando}>
            {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar reprogramación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
