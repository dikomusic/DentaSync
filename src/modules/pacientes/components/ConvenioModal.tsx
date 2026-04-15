"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Slider } from "@/components/ui/slider";
import { type Paciente, type ConvenioDto, TipoConvenio } from "../types/pacientes.types";

// ─── Schema ────────────────────────────────────────────────────────────────

const convenioSchema = z.object({
  tipo:                z.nativeEnum(TipoConvenio, { required_error: "Selecciona el tipo de convenio" }),
  nombreEntidad:       z.string().min(2, "Mínimo 2 caracteres").max(80),
  numeroPoliza:        z.string().max(40).optional(),
  porcentajeDescuento: z.number().min(1, "Mínimo 1%").max(100, "Máximo 100%"),
  vigenciaDesde:       z.string().min(1, "La fecha de inicio es requerida"),
  vigenciaHasta:       z.string().optional(),
}).refine(
  (data) => {
    if (data.vigenciaHasta && data.vigenciaDesde) {
      return data.vigenciaHasta >= data.vigenciaDesde;
    }
    return true;
  },
  {
    message: "La fecha de vencimiento debe ser posterior al inicio",
    path: ["vigenciaHasta"],
  }
);

type ConvenioValues = z.infer<typeof convenioSchema>;

// ─── Config visual ─────────────────────────────────────────────────────────

const TIPO_CONVENIO_OPTIONS: { value: TipoConvenio; label: string }[] = [
  { value: TipoConvenio.EMPRESA,     label: "Empresa" },
  { value: TipoConvenio.ASEGURADORA, label: "Aseguradora" },
  { value: TipoConvenio.MUTUAL,      label: "Mutual" },
  { value: TipoConvenio.OBRA_SOCIAL, label: "Obra Social" },
];

// ─── Props ─────────────────────────────────────────────────────────────────

interface ConvenioModalProps {
  abierto:         boolean;
  paciente:        Paciente | null;
  onCerrar:        () => void;
  onGuardarConvenio: (dto: ConvenioDto) => Promise<void>;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function ConvenioModal({
  abierto,
  paciente,
  onCerrar,
  onGuardarConvenio,
}: ConvenioModalProps) {
  const convenioActual = paciente?.convenio;

  const form = useForm<ConvenioValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      tipo:                convenioActual?.tipo             ?? undefined,
      nombreEntidad:       convenioActual?.nombreEntidad    ?? "",
      numeroPoliza:        convenioActual?.numeroPoliza     ?? "",
      porcentajeDescuento: convenioActual?.porcentajeDescuento ?? 20,
      vigenciaDesde:       convenioActual?.vigenciaDesde    ?? "",
      vigenciaHasta:       convenioActual?.vigenciaHasta    ?? "",
    },
  });

  const { isSubmitting } = form.formState;
  const descuento = form.watch("porcentajeDescuento");

  // Sincronizar si cambia el paciente
  useEffect(() => {
    if (paciente) {
      const conv = paciente.convenio;
      form.reset({
        tipo:                conv?.tipo             ?? undefined,
        nombreEntidad:       conv?.nombreEntidad    ?? "",
        numeroPoliza:        conv?.numeroPoliza     ?? "",
        porcentajeDescuento: conv?.porcentajeDescuento ?? 20,
        vigenciaDesde:       conv?.vigenciaDesde    ?? "",
        vigenciaHasta:       conv?.vigenciaHasta    ?? "",
      });
    }
  }, [paciente, form]);

  async function onSubmit(values: ConvenioValues) {
    if (!paciente) return;
    await onGuardarConvenio({
      pacienteId:          paciente.id,
      tipo:                values.tipo,
      nombreEntidad:       values.nombreEntidad,
      numeroPoliza:        values.numeroPoliza || undefined,
      porcentajeDescuento: values.porcentajeDescuento,
      vigenciaDesde:       values.vigenciaDesde,
      vigenciaHasta:       values.vigenciaHasta || undefined,
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
            <Building2 className="h-5 w-5 text-primary" />
            {convenioActual?.activo ? "Editar convenio" : "Agregar convenio"}
          </DialogTitle>
          <DialogDescription>
            {paciente.nombre} {paciente.apellido} · DNI {paciente.dni}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Tipo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de convenio <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPO_CONVENIO_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre entidad */}
            <FormField
              control={form.control}
              name="nombreEntidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la entidad <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Seguros Vida, Tech Corp S.A.C." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Número de póliza */}
            <FormField
              control={form.control}
              name="numeroPoliza"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de póliza <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. SV-2024-00145" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Porcentaje de descuento */}
            <FormField
              control={form.control}
              name="porcentajeDescuento"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Descuento <span className="text-destructive">*</span></FormLabel>
                    <span className="text-sm font-semibold text-primary">{descuento}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={([v]) => field.onChange(v)}
                      className="pt-1"
                    />
                  </FormControl>
                  <FormDescription>
                    El descuento se aplicará automáticamente en los cobros del paciente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vigencia desde - hasta */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="vigenciaDesde"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vigencia desde <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vigenciaHasta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vigencia hasta <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-1">
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
                {convenioActual?.activo ? "Actualizar convenio" : "Guardar convenio"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
