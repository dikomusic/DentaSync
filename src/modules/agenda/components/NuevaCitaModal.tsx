"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronRight, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type Cita, type CrearCitaDto } from "../types/agenda.types";
import {
  ESPECIALIDADES,
  PACIENTES,
  useDoctoresPorEspecialidad,
  useSlotsDisponibles,
} from "../hooks/useAgenda";

// ─── Schema por pasos ─────────────────────────────────────────────────────

const paso1Schema = z.object({
  especialidadId: z.string().min(1, "La especialidad es obligatoria"),
});
const paso2Schema = z.object({
  doctorId: z.string().min(1, "Selecciona un doctor"),
  fecha:    z.date({ required_error: "Selecciona una fecha" }),
});
const paso3Schema = z.object({
  horaInicio: z.string().min(1, "Selecciona un horario disponible"),
});
const paso4Schema = z.object({
  pacienteId:     z.string().min(1, "Selecciona un paciente"),
  motivoConsulta: z.string().max(200).optional(),
  notas:          z.string().max(300).optional(),
});

const nuevaCitaSchema = paso1Schema.merge(paso2Schema).merge(paso3Schema).merge(paso4Schema);
type NuevaCitaValues = z.infer<typeof nuevaCitaSchema>;

// ─── Stepper visual ──────────────────────────────────────────────────────

const PASOS = ["Especialidad", "Doctor y fecha", "Horario", "Paciente"] as const;

function StepIndicator({ pasoActual }: { pasoActual: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {PASOS.map((nombre, i) => (
        <div key={nombre} className="flex items-center gap-1">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
              i < pasoActual
                ? "bg-primary text-primary-foreground"
                : i === pasoActual
                ? "bg-primary/20 text-primary border-2 border-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i < pasoActual ? "✓" : i + 1}
          </div>
          <span
            className={cn(
              "text-xs hidden sm:block",
              i === pasoActual ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {nombre}
          </span>
          {i < PASOS.length - 1 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────

interface NuevaCitaModalProps {
  abierto:       boolean;
  todasLasCitas: Cita[];
  onCerrar:      () => void;
  onCrear:       (dto: CrearCitaDto) => Promise<void>;
}

// ─── Componente ──────────────────────────────────────────────────────────

export function NuevaCitaModal({ abierto, todasLasCitas, onCerrar, onCrear }: NuevaCitaModalProps) {
  const [paso, setPaso]               = useState(0);
  const [calAbierto, setCalAbierto]   = useState(false);
  const [busquedaPac, setBusquedaPac] = useState("");

  const form = useForm<NuevaCitaValues>({
    resolver: zodResolver(nuevaCitaSchema),
    defaultValues: {
      especialidadId: "",
      doctorId:       "",
      horaInicio:     "",
      pacienteId:     "",
      motivoConsulta: "",
      notas:          "",
    },
  });

  const { watch, setValue, getValues, trigger } = form;
  const { isSubmitting } = form.formState;

  // Valores reactivos para alimentar hooks dependientes
  const espId    = watch("especialidadId");
  const docId    = watch("doctorId");
  const fechaVal = watch("fecha");
  const fechaStr = fechaVal ? format(fechaVal, "yyyy-MM-dd") : undefined;

  const { doctores }          = useDoctoresPorEspecialidad(espId || undefined);
  const { slots }             = useSlotsDisponibles(docId || undefined, fechaStr, espId || undefined, todasLasCitas);
  const slotsDisponibles      = slots.filter((s) => s.disponible);

  const pacientesFiltrados = PACIENTES.filter((p) => {
    if (!busquedaPac) return true;
    const q = busquedaPac.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      p.telefono.includes(q)
    );
  });

  // Validar el paso actual antes de avanzar
  async function avanzar() {
    let valido = false;
    if (paso === 0) valido = await trigger("especialidadId");
    if (paso === 1) valido = await trigger(["doctorId", "fecha"]);
    if (paso === 2) valido = await trigger("horaInicio");
    if (paso === 3) {
      valido = await trigger("pacienteId");
      if (valido) await form.handleSubmit(onSubmit)();
      return;
    }
    if (valido) setPaso((p) => p + 1);
  }

  async function onSubmit(values: NuevaCitaValues) {
    await onCrear({
      especialidadId:  values.especialidadId,
      doctorId:        values.doctorId,
      pacienteId:      values.pacienteId,
      fecha:           format(values.fecha, "yyyy-MM-dd"),
      horaInicio:      values.horaInicio,
      motivoConsulta:  values.motivoConsulta,
      notas:           values.notas,
    });
    handleCerrar();
  }

  function handleCerrar() {
    if (isSubmitting) return;
    form.reset();
    setPaso(0);
    setBusquedaPac("");
    onCerrar();
  }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
          <DialogDescription>Complete los datos de la cita paso a paso.</DialogDescription>
        </DialogHeader>

        <StepIndicator pasoActual={paso} />

        <Form {...form}>
          <form className="space-y-4">

            {/* ── Paso 0: Especialidad ─────────────────────────────────── */}
            {paso === 0 && (
              <FormField
                control={form.control}
                name="especialidadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Especialidad <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={(v) => { field.onChange(v); setValue("doctorId", ""); setValue("horaInicio", ""); }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una especialidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESPECIALIDADES.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                              {e.nombre}
                              <span className="text-muted-foreground text-xs">({e.duracionDefaultMin} min)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ── Paso 1: Doctor + Fecha ────────────────────────────────── */}
            {paso === 1 && (
              <div className="space-y-4">
                {/* Doctor — deshabilitado si no hay especialidad */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor <span className="text-destructive">*</span></FormLabel>
                      <Select
                        onValueChange={(v) => { field.onChange(v); setValue("horaInicio", ""); }}
                        value={field.value}
                        disabled={!espId || doctores.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={doctores.length === 0 ? "Sin doctores para esta especialidad" : "Selecciona un doctor"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctores.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              Dr. {d.nombre} {d.apellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha */}
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha <span className="text-destructive">*</span></FormLabel>
                      <Popover open={calAbierto} onOpenChange={setCalAbierto}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: es }) : "Selecciona una fecha"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(d) => { field.onChange(d); setValue("horaInicio", ""); setCalAbierto(false); }}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── Paso 2: Horario ───────────────────────────────────────── */}
            {paso === 2 && (
              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horario disponible <span className="text-destructive">*</span></FormLabel>
                    {slotsDisponibles.length === 0 ? (
                      <p className="text-sm text-muted-foreground border rounded-md p-4 text-center">
                        No hay horarios disponibles para la fecha seleccionada.
                      </p>
                    ) : (
                      <ScrollArea className="h-52">
                        <div className="grid grid-cols-3 gap-2 pr-4">
                          {slotsDisponibles.map((s) => (
                            <button
                              key={s.horaInicio}
                              type="button"
                              onClick={() => field.onChange(s.horaInicio)}
                              className={cn(
                                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                                field.value === s.horaInicio
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background hover:bg-accent"
                              )}
                            >
                              {s.horaInicio}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ── Paso 3: Paciente ──────────────────────────────────────── */}
            {paso === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pacienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente <span className="text-destructive">*</span></FormLabel>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nombre o teléfono..."
                          className="pl-9"
                          value={busquedaPac}
                          onChange={(e) => setBusquedaPac(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-40 rounded-md border">
                        <div className="p-1">
                          {pacientesFiltrados.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => field.onChange(p.id)}
                              className={cn(
                                "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors",
                                field.value === p.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent"
                              )}
                            >
                              <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                field.value === p.id ? "bg-primary-foreground/20" : "bg-muted"
                              )}>
                                {p.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{p.nombre} {p.apellido}</p>
                                <p className={cn("text-xs", field.value === p.id ? "opacity-80" : "text-muted-foreground")}>
                                  {p.telefono}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motivoConsulta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo de consulta <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe brevemente el motivo..." rows={2} className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>

        {/* Resumen rápido del progreso */}
        {paso > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
            {getValues("especialidadId") && (
              <Badge variant="secondary" className="text-xs">
                {ESPECIALIDADES.find((e) => e.id === getValues("especialidadId"))?.nombre}
              </Badge>
            )}
            {fechaVal && (
              <Badge variant="secondary" className="text-xs">
                {format(fechaVal, "dd/MM/yyyy")}
              </Badge>
            )}
            {watch("horaInicio") && (
              <Badge variant="secondary" className="text-xs">
                {watch("horaInicio")}
              </Badge>
            )}
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between gap-2 pt-2">
          <Button
            variant="outline"
            onClick={paso === 0 ? handleCerrar : () => setPaso((p) => p - 1)}
            disabled={isSubmitting}
          >
            {paso === 0 ? "Cancelar" : "Atrás"}
          </Button>
          <Button onClick={avanzar} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {paso === PASOS.length - 1 ? "Crear cita" : "Siguiente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
