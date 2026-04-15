"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ClockIcon, Loader2, Search, Trash2, UserPlus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  type ItemListaEspera,
  type AgregarListaEsperaDto,
  PrioridadEspera,
} from "../types/agenda.types";
import { ESPECIALIDADES, PACIENTES } from "../hooks/useAgenda";

// ─── Schema ────────────────────────────────────────────────────────────────

const listaEsperaSchema = z.object({
  pacienteId:    z.string().min(1, "Selecciona un paciente"),
  especialidadId: z.string().min(1, "Selecciona una especialidad"),
  prioridad:     z.nativeEnum(PrioridadEspera),
  notas:         z.string().max(200).optional(),
});

type ListaEsperaValues = z.infer<typeof listaEsperaSchema>;

// ─── Colores de prioridad ─────────────────────────────────────────────────

const PRIORIDAD_CONFIG: Record<PrioridadEspera, { label: string; clase: string }> = {
  [PrioridadEspera.ALTA]:   { label: "Alta",   clase: "bg-red-100 text-red-700 border-red-200" },
  [PrioridadEspera.NORMAL]: { label: "Normal", clase: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  [PrioridadEspera.BAJA]:   { label: "Baja",   clase: "bg-green-100 text-green-700 border-green-200" },
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface ListaEsperaModalProps {
  abierto:      boolean;
  listaEspera:  ItemListaEspera[];
  onCerrar:     () => void;
  onAgregar:    (dto: AgregarListaEsperaDto) => Promise<void>;
  onEliminar:   (id: string) => Promise<void>;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function ListaEsperaModal({
  abierto,
  listaEspera,
  onCerrar,
  onAgregar,
  onEliminar,
}: ListaEsperaModalProps) {
  const [modoAgregar, setModoAgregar]   = useState(false);
  const [busquedaPac, setBusquedaPac]   = useState("");
  const [eliminando, setEliminando]     = useState<string | null>(null);

  const form = useForm<ListaEsperaValues>({
    resolver: zodResolver(listaEsperaSchema),
    defaultValues: {
      pacienteId:    "",
      especialidadId: "",
      prioridad:     PrioridadEspera.NORMAL,
      notas:         "",
    },
  });

  const { isSubmitting } = form.formState;

  const pacientesFiltrados = PACIENTES.filter((p) => {
    if (!busquedaPac) return true;
    const q = busquedaPac.toLowerCase();
    return p.nombre.toLowerCase().includes(q) || p.apellido.toLowerCase().includes(q);
  });

  async function onSubmit(values: ListaEsperaValues) {
    await onAgregar(values);
    form.reset();
    setModoAgregar(false);
    setBusquedaPac("");
  }

  async function handleEliminar(id: string) {
    setEliminando(id);
    try {
      await onEliminar(id);
    } finally {
      setEliminando(null);
    }
  }

  function handleCerrar() {
    if (isSubmitting) return;
    form.reset();
    setModoAgregar(false);
    setBusquedaPac("");
    onCerrar();
  }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary" />
            Lista de espera
          </DialogTitle>
          <DialogDescription>
            Pacientes aguardando disponibilidad de cita.
          </DialogDescription>
        </DialogHeader>

        {/* Lista existente */}
        {!modoAgregar && (
          <>
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-2">
                {listaEspera.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay pacientes en lista de espera.
                  </p>
                ) : (
                  listaEspera.map((item) => {
                    const priConfig = PRIORIDAD_CONFIG[item.prioridad];
                    return (
                      <div key={item.id} className="flex items-start justify-between rounded-lg border p-3 gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">
                              {item.paciente.nombre} {item.paciente.apellido}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn("text-xs border", priConfig.clase)}
                            >
                              {priConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.especialidadNombre} · Desde:{" "}
                            {format(parseISO(item.fechaRegistro), "d MMM", { locale: es })}
                          </p>
                          {item.notas && (
                            <p className="text-xs text-muted-foreground italic truncate">
                              {item.notas}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          disabled={eliminando === item.id}
                          onClick={() => handleEliminar(item.id)}
                        >
                          {eliminando === item.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <Separator />
            <Button onClick={() => setModoAgregar(true)} className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              Agregar a lista de espera
            </Button>
          </>
        )}

        {/* Formulario para agregar */}
        {modoAgregar && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Paciente */}
              <FormField
                control={form.control}
                name="pacienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente <span className="text-destructive">*</span></FormLabel>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar paciente..."
                        className="pl-9"
                        value={busquedaPac}
                        onChange={(e) => setBusquedaPac(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-32 rounded-md border">
                      <div className="p-1">
                        {pacientesFiltrados.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => field.onChange(p.id)}
                            className={cn(
                              "w-full rounded px-3 py-1.5 text-sm text-left transition-colors",
                              field.value === p.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                          >
                            {p.nombre} {p.apellido} · {p.telefono}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Especialidad + Prioridad en fila */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="especialidadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESPECIALIDADES.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PRIORIDAD_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Notas */}
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observaciones adicionales..." rows={2} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setModoAgregar(false)} disabled={isSubmitting}>
                  Volver
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Agregar
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
