"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  type Paciente,
  type ClasificarPacienteDto,
  EstadoPaciente,
  ClasificacionPaciente,
} from "../types/pacientes.types";

// ─── Schema ────────────────────────────────────────────────────────────────

const clasificarSchema = z.object({
  estado:        z.nativeEnum(EstadoPaciente),
  clasificacion: z.nativeEnum(ClasificacionPaciente),
  motivo:        z.string().max(300).optional(),
}).refine(
  (data) => {
    // Si el estado es MOROSO o SUSPENDIDO, el motivo es obligatorio
    if (data.estado === EstadoPaciente.MOROSO || data.estado === EstadoPaciente.SUSPENDIDO) {
      return (data.motivo?.trim().length ?? 0) >= 10;
    }
    return true;
  },
  {
    message: "Debes indicar el motivo (mínimo 10 caracteres) para este estado",
    path: ["motivo"],
  }
);

type ClasificarValues = z.infer<typeof clasificarSchema>;

// ─── Config visual ─────────────────────────────────────────────────────────

const ESTADO_OPTIONS: { value: EstadoPaciente; label: string }[] = [
  { value: EstadoPaciente.ACTIVO,     label: "Activo" },
  { value: EstadoPaciente.INACTIVO,   label: "Inactivo" },
  { value: EstadoPaciente.MOROSO,     label: "Moroso" },
  { value: EstadoPaciente.SUSPENDIDO, label: "Suspendido" },
];

const CLASIFICACION_OPTIONS: { value: ClasificacionPaciente; label: string }[] = [
  { value: ClasificacionPaciente.NUEVO,    label: "Nuevo" },
  { value: ClasificacionPaciente.REGULAR,  label: "Regular" },
  { value: ClasificacionPaciente.VIP,      label: "VIP" },
  { value: ClasificacionPaciente.CONVENIO, label: "Convenio" },
];

// ─── Props ─────────────────────────────────────────────────────────────────

interface ClasificarEstadoModalProps {
  abierto:     boolean;
  paciente:    Paciente | null;
  onCerrar:    () => void;
  onClasificar: (dto: ClasificarPacienteDto) => Promise<void>;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function ClasificarEstadoModal({
  abierto,
  paciente,
  onCerrar,
  onClasificar,
}: ClasificarEstadoModalProps) {
  const form = useForm<ClasificarValues>({
    resolver: zodResolver(clasificarSchema),
    defaultValues: {
      estado:        paciente?.estado        ?? EstadoPaciente.ACTIVO,
      clasificacion: paciente?.clasificacion ?? ClasificacionPaciente.REGULAR,
      motivo:        paciente?.motivoEstado  ?? "",
    },
  });

  const { isSubmitting } = form.formState;
  const estadoSeleccionado = form.watch("estado");
  const requiereMotivo =
    estadoSeleccionado === EstadoPaciente.MOROSO ||
    estadoSeleccionado === EstadoPaciente.SUSPENDIDO;

  // Sincronizar valores cuando cambia el paciente
  useEffect(() => {
    if (paciente) {
      form.reset({
        estado:        paciente.estado,
        clasificacion: paciente.clasificacion,
        motivo:        paciente.motivoEstado ?? "",
      });
    }
  }, [paciente, form]);

  async function onSubmit(values: ClasificarValues) {
    if (!paciente) return;
    await onClasificar({
      pacienteId:    paciente.id,
      estado:        values.estado,
      clasificacion: values.clasificacion,
      motivo:        values.motivo,
    });
    handleCerrar();
  }

  function handleCerrar() {
    if (isSubmitting) return;
    form.reset();
    onCerrar();
  }

  if (!paciente) return null;

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Clasificar estado del paciente
          </DialogTitle>
          <DialogDescription>
            {paciente.nombre} {paciente.apellido} · DNI {paciente.dni}
          </DialogDescription>
        </DialogHeader>

        {/* Alerta moroso */}
        {estadoSeleccionado === EstadoPaciente.MOROSO && (
          <Alert variant="destructive" className="border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Al marcar como <strong>Moroso</strong>, el paciente será alertado en futuras citas.
              Asegúrate de registrar la deuda pendiente correctamente.
            </AlertDescription>
          </Alert>
        )}

        {estadoSeleccionado === EstadoPaciente.SUSPENDIDO && (
          <Alert className="border-orange-300 bg-orange-50 text-orange-900">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              Un paciente <strong>Suspendido</strong> no podrá agendar nuevas citas hasta que
              se reactive su estado.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADO_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clasificación */}
            <FormField
              control={form.control}
              name="clasificacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clasificación <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLASIFICACION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Motivo */}
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Motivo{requiereMotivo && <span className="text-destructive"> *</span>}
                    {!requiereMotivo && (
                      <span className="text-muted-foreground text-xs"> (opcional)</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        requiereMotivo
                          ? "Explica el motivo del cambio de estado..."
                          : "Observaciones opcionales..."
                      }
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCerrar}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
