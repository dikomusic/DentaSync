"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, UserPlus } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type Paciente, type RegistrarPacienteDto } from "../types/pacientes.types";

// ─── Schema ────────────────────────────────────────────────────────────────

const registrarPacienteSchema = z.object({
  nombre:              z.string().min(2, "Mínimo 2 caracteres").max(60),
  apellido:            z.string().min(2, "Mínimo 2 caracteres").max(60),
  dni:                 z.string().length(8, "El DNI debe tener exactamente 8 dígitos").regex(/^\d{8}$/, "Solo dígitos"),
  fechaNacimiento:     z.string().min(1, "La fecha de nacimiento es requerida"),
  genero:              z.enum(["M", "F", "OTRO"], { required_error: "Selecciona un género" }),
  telefono:            z.string().min(7, "Teléfono inválido").max(20),
  telefonoEmergencia:  z.string().max(20).optional(),
  email:               z.string().email("Email inválido").optional().or(z.literal("")),
  direccion:           z.string().max(120).optional(),
  ciudad:              z.string().max(60).optional(),
});

type RegistrarPacienteValues = z.infer<typeof registrarPacienteSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────

interface RegistrarPacienteModalProps {
  abierto:        boolean;
  onCerrar:       () => void;
  onRegistrar:    (dto: RegistrarPacienteDto) => Promise<Paciente>;
  verificarDni:   (dni: string) => Paciente | null;
  onVerPerfil?:   (paciente: Paciente) => void;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function RegistrarPacienteModal({
  abierto,
  onCerrar,
  onRegistrar,
  verificarDni,
  onVerPerfil,
}: RegistrarPacienteModalProps) {
  const [pacienteExistente, setPacienteExistente] = useState<Paciente | null>(null);

  const form = useForm<RegistrarPacienteValues>({
    resolver: zodResolver(registrarPacienteSchema),
    defaultValues: {
      nombre:             "",
      apellido:           "",
      dni:                "",
      fechaNacimiento:    "",
      genero:             undefined,
      telefono:           "",
      telefonoEmergencia: "",
      email:              "",
      direccion:          "",
      ciudad:             "",
    },
  });

  const { isSubmitting, isDirty } = form.formState;
  const dniValue = form.watch("dni");

  // Verificar DNI en tiempo real cuando tenga 8 dígitos
  useEffect(() => {
    if (/^\d{8}$/.test(dniValue)) {
      const existente = verificarDni(dniValue);
      setPacienteExistente(existente);
    } else {
      setPacienteExistente(null);
    }
  }, [dniValue, verificarDni]);

  async function onSubmit(values: RegistrarPacienteValues) {
    const dto: RegistrarPacienteDto = {
      nombre:          values.nombre,
      apellido:        values.apellido,
      dni:             values.dni,
      fechaNacimiento: values.fechaNacimiento,
      genero:          values.genero,
      telefono:        values.telefono,
      ...(values.telefonoEmergencia && { telefonoEmergencia: values.telefonoEmergencia }),
      ...(values.email              && { email: values.email }),
      ...(values.direccion          && { direccion: values.direccion }),
      ...(values.ciudad             && { ciudad: values.ciudad }),
    };
    await onRegistrar(dto);
    handleCerrar();
  }

  function handleCerrar() {
    if (isSubmitting) return;
    form.reset();
    setPacienteExistente(null);
    onCerrar();
  }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Registrar nuevo paciente
          </DialogTitle>
          <DialogDescription>
            Completa los datos del paciente. Los campos marcados con{" "}
            <span className="text-destructive">*</span> son obligatorios.
          </DialogDescription>
        </DialogHeader>

        {/* Alerta paciente existente (verificar atención anterior) */}
        {pacienteExistente && (
          <Alert variant="destructive" className="border-amber-300 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between gap-2">
              <span>
                Ya existe un paciente con este DNI:{" "}
                <strong>{pacienteExistente.nombre} {pacienteExistente.apellido}</strong>
              </span>
              {onVerPerfil && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-amber-400 text-amber-900 hover:bg-amber-100"
                  onClick={() => { onVerPerfil(pacienteExistente); handleCerrar(); }}
                >
                  Ver perfil
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 pb-2">

                {/* Nombre + Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Sofía" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Ramírez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* DNI + Género */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345678"
                            maxLength={8}
                            className={pacienteExistente ? "border-amber-400 focus-visible:ring-amber-400" : ""}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                            <SelectItem value="OTRO">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fecha de nacimiento */}
                <FormField
                  control={form.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" max={new Date().toISOString().split("T")[0]} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Teléfono + Teléfono emergencia */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="555-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefonoEmergencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tel. emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="555-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="paciente@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dirección + Ciudad */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Los Laureles 425" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Lima" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCerrar}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !!pacienteExistente || !isDirty}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar paciente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
