"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { type Cita } from "../types/agenda.types";

// ─── Schema ────────────────────────────────────────────────────────────────

const cancelarSchema = z.object({
  motivoCancelacion: z
    .string()
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(300, "Máximo 300 caracteres"),
});

type CancelarFormValues = z.infer<typeof cancelarSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────

interface CancelarCitaModalProps {
  cita:    Cita | null;
  abierto: boolean;
  onCerrar:    () => void;
  onConfirmar: (citaId: string, motivo: string) => Promise<void>;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function CancelarCitaModal({ cita, abierto, onCerrar, onConfirmar }: CancelarCitaModalProps) {
  const form = useForm<CancelarFormValues>({
    resolver: zodResolver(cancelarSchema),
    defaultValues: { motivoCancelacion: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: CancelarFormValues) {
    if (!cita) return;
    await onConfirmar(cita.id, values.motivoCancelacion);
    form.reset();
    onCerrar();
  }

  function handleCerrar() {
    if (isSubmitting) return;
    form.reset();
    onCerrar();
  }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancelar cita
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La cita quedará marcada como cancelada.
          </DialogDescription>
        </DialogHeader>

        {/* Resumen de la cita */}
        {cita && (
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium">
              {cita.paciente.nombre} {cita.paciente.apellido}
            </p>
            <p className="text-muted-foreground">
              {cita.fecha} · {cita.horaInicio} – {cita.horaFin}
            </p>
            <p className="text-muted-foreground">
              Dr. {cita.doctor.nombre} {cita.doctor.apellido} · {cita.especialidadNombre}
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="motivoCancelacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Motivo de cancelación <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el motivo de la cancelación..."
                      className="resize-none"
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground text-right">
                    {field.value.length}/300
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCerrar} disabled={isSubmitting}>
                Volver
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar cancelación
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
