"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInYears, parseISO } from "date-fns";
import {
  AlertTriangle,
  Building2,
  Clock,
  Edit2,
  FileText,
  Loader2,
  Plus,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  type Paciente,
  type EditarPacienteDto,
  type AgregarAlergiaDto,
  type AgregarAntecedenteDto,
  type AdjuntarDocumentoDto,
  EstadoPaciente,
  ClasificacionPaciente,
  SeveridadAlergia,
  TipoAntecedente,
  TipoDocumento,
} from "../types/pacientes.types";

// ─── Schemas inline ────────────────────────────────────────────────────────

const editarSchema = z.object({
  nombre:             z.string().min(2).max(60),
  apellido:           z.string().min(2).max(60),
  telefono:           z.string().min(7).max(20),
  telefonoEmergencia: z.string().max(20).optional(),
  email:              z.string().email().optional().or(z.literal("")),
  direccion:          z.string().max(120).optional(),
  ciudad:             z.string().max(60).optional(),
});

const alergiaSchema = z.object({
  sustancia:      z.string().min(2, "Indica la sustancia").max(80),
  severidad:      z.nativeEnum(SeveridadAlergia),
  reaccion:       z.string().min(5, "Describe la reacción").max(200),
  fechaDeteccion: z.string().min(1, "Indica la fecha"),
});

const antecedenteSchema = z.object({
  tipo:        z.nativeEnum(TipoAntecedente),
  descripcion: z.string().min(5, "Mínimo 5 caracteres").max(300),
});

const documentoSchema = z.object({
  nombre:      z.string().min(2).max(100),
  tipo:        z.nativeEnum(TipoDocumento),
  descripcion: z.string().max(200).optional(),
});

type EditarValues        = z.infer<typeof editarSchema>;
type AlergiaValues       = z.infer<typeof alergiaSchema>;
type AntecedenteValues   = z.infer<typeof antecedenteSchema>;
type DocumentoValues     = z.infer<typeof documentoSchema>;

// ─── Config visual ─────────────────────────────────────────────────────────

const ESTADO_CLASE: Record<EstadoPaciente, string> = {
  [EstadoPaciente.ACTIVO]:     "bg-green-100 text-green-700",
  [EstadoPaciente.INACTIVO]:   "bg-gray-100 text-gray-600",
  [EstadoPaciente.MOROSO]:     "bg-red-100 text-red-700",
  [EstadoPaciente.SUSPENDIDO]: "bg-orange-100 text-orange-700",
};

const CLASIFICACION_CLASE: Record<ClasificacionPaciente, string> = {
  [ClasificacionPaciente.NUEVO]:    "bg-blue-100 text-blue-700",
  [ClasificacionPaciente.REGULAR]:  "border border-border text-muted-foreground",
  [ClasificacionPaciente.VIP]:      "bg-purple-100 text-purple-700",
  [ClasificacionPaciente.CONVENIO]: "bg-teal-100 text-teal-700",
};

const SEVERIDAD_CLASE: Record<SeveridadAlergia, string> = {
  [SeveridadAlergia.LEVE]:     "bg-yellow-100 text-yellow-700",
  [SeveridadAlergia.MODERADA]: "bg-orange-100 text-orange-700",
  [SeveridadAlergia.GRAVE]:    "bg-red-100 text-red-700",
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface PacientePerfilSheetProps {
  abierto:            boolean;
  paciente:           Paciente | null;
  modificadoPor:      string;
  onCerrar:           () => void;
  onEditar:           (id: string, dto: EditarPacienteDto, modificadoPor: string) => Promise<void>;
  onAgregarAlergia:   (dto: AgregarAlergiaDto, registradoPor: string) => Promise<void>;
  onAgregarAntecedente: (dto: AgregarAntecedenteDto) => Promise<void>;
  onAdjuntarDocumento: (dto: AdjuntarDocumentoDto, subidoPor: string) => Promise<void>;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function PacientePerfilSheet({
  abierto,
  paciente,
  modificadoPor,
  onCerrar,
  onEditar,
  onAgregarAlergia,
  onAgregarAntecedente,
  onAdjuntarDocumento,
}: PacientePerfilSheetProps) {
  const [modoEditar, setModoEditar]               = useState(false);
  const [mostrarFormAlergia, setMostrarFormAlergia] = useState(false);
  const [mostrarFormAnt, setMostrarFormAnt]         = useState(false);
  const [mostrarFormDoc, setMostrarFormDoc]         = useState(false);

  // ── Formulario editar datos ──
  const editarForm = useForm<EditarValues>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      nombre:             paciente?.nombre             ?? "",
      apellido:           paciente?.apellido           ?? "",
      telefono:           paciente?.telefono           ?? "",
      telefonoEmergencia: paciente?.telefonoEmergencia ?? "",
      email:              paciente?.email              ?? "",
      direccion:          paciente?.direccion          ?? "",
      ciudad:             paciente?.ciudad             ?? "",
    },
  });

  // ── Formulario alergia ──
  const alergiaForm = useForm<AlergiaValues>({
    resolver: zodResolver(alergiaSchema),
    defaultValues: { sustancia: "", severidad: SeveridadAlergia.LEVE, reaccion: "", fechaDeteccion: "" },
  });

  // ── Formulario antecedente ──
  const antecedenteForm = useForm<AntecedenteValues>({
    resolver: zodResolver(antecedenteSchema),
    defaultValues: { tipo: TipoAntecedente.ENFERMEDAD, descripcion: "" },
  });

  // ── Formulario documento ──
  const documentoForm = useForm<DocumentoValues>({
    resolver: zodResolver(documentoSchema),
    defaultValues: { nombre: "", tipo: TipoDocumento.OTRO, descripcion: "" },
  });

  if (!paciente) return null;

  const edad = differenceInYears(new Date(), parseISO(paciente.fechaNacimiento));
  const tieneAlergiasGraves = paciente.antecedentes?.alergias.some((a) => a.severidad === SeveridadAlergia.GRAVE);

  // ── Handlers ──
  async function handleGuardarEdicion(values: EditarValues) {
    const dto: EditarPacienteDto = {
      nombre:    values.nombre,
      apellido:  values.apellido,
      telefono:  values.telefono,
      ...(values.telefonoEmergencia && { telefonoEmergencia: values.telefonoEmergencia }),
      ...(values.email     && { email:    values.email }),
      ...(values.direccion && { direccion: values.direccion }),
      ...(values.ciudad    && { ciudad:   values.ciudad }),
    };
    await onEditar(paciente.id, dto, modificadoPor);
    setModoEditar(false);
  }

  async function handleGuardarAlergia(values: AlergiaValues) {
    await onAgregarAlergia(
      { pacienteId: paciente.id, ...values },
      modificadoPor
    );
    alergiaForm.reset();
    setMostrarFormAlergia(false);
  }

  async function handleGuardarAntecedente(values: AntecedenteValues) {
    await onAgregarAntecedente({ pacienteId: paciente.id, ...values });
    antecedenteForm.reset();
    setMostrarFormAnt(false);
  }

  async function handleGuardarDocumento(values: DocumentoValues) {
    await onAdjuntarDocumento(
      { pacienteId: paciente.id, tamanioKb: 0, ...values },
      modificadoPor
    );
    documentoForm.reset();
    setMostrarFormDoc(false);
  }

  return (
    <Sheet open={abierto} onOpenChange={onCerrar}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold",
              paciente.estado === EstadoPaciente.MOROSO
                ? "bg-red-100 text-red-700"
                : "bg-primary/10 text-primary"
            )}>
              {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg leading-tight">
                {paciente.nombre} {paciente.apellido}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 flex-wrap mt-1">
                <span>DNI {paciente.dni}</span>
                <span>·</span>
                <span>{edad} años</span>
                <span>·</span>
                <Badge variant="outline" className={cn("text-xs border-0", ESTADO_CLASE[paciente.estado])}>
                  {paciente.estado}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", CLASIFICACION_CLASE[paciente.clasificacion])}>
                  {paciente.clasificacion}
                </Badge>
                {tieneAlergiasGraves && (
                  <span className="text-red-600 text-xs font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Alergia grave
                  </span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="perfil" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 grid grid-cols-6 h-auto shrink-0">
            <TabsTrigger value="perfil"     className="text-xs py-1.5"><User className="h-3.5 w-3.5 mr-1" />Perfil</TabsTrigger>
            <TabsTrigger value="antecedentes" className="text-xs py-1.5"><Shield className="h-3.5 w-3.5 mr-1" />Anteced.</TabsTrigger>
            <TabsTrigger value="alergias"   className="text-xs py-1.5"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Alergias</TabsTrigger>
            <TabsTrigger value="convenio"   className="text-xs py-1.5"><Building2 className="h-3.5 w-3.5 mr-1" />Convenio</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs py-1.5"><FileText className="h-3.5 w-3.5 mr-1" />Docs</TabsTrigger>
            <TabsTrigger value="historial"  className="text-xs py-1.5"><Clock className="h-3.5 w-3.5 mr-1" />Historial</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 mt-4">

            {/* ── TAB: PERFIL ── */}
            <TabsContent value="perfil" className="mt-0 space-y-4 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Datos personales</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (modoEditar) {
                      editarForm.reset();
                      setModoEditar(false);
                    } else {
                      editarForm.reset({
                        nombre:             paciente.nombre,
                        apellido:           paciente.apellido,
                        telefono:           paciente.telefono,
                        telefonoEmergencia: paciente.telefonoEmergencia ?? "",
                        email:              paciente.email              ?? "",
                        direccion:          paciente.direccion          ?? "",
                        ciudad:             paciente.ciudad             ?? "",
                      });
                      setModoEditar(true);
                    }
                  }}
                >
                  {modoEditar ? <X className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                  {modoEditar ? "Cancelar" : "Editar"}
                </Button>
              </div>

              {!modoEditar ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <Campo label="Nombre"       valor={`${paciente.nombre} ${paciente.apellido}`} />
                  <Campo label="DNI"          valor={paciente.dni} mono />
                  <Campo label="Nacimiento"   valor={`${paciente.fechaNacimiento} (${edad} años)`} />
                  <Campo label="Género"       valor={paciente.genero === "M" ? "Masculino" : paciente.genero === "F" ? "Femenino" : "Otro"} />
                  <Campo label="Teléfono"     valor={paciente.telefono} />
                  <Campo label="Tel. emergencia" valor={paciente.telefonoEmergencia ?? "—"} />
                  <Campo label="Email"        valor={paciente.email ?? "—"} />
                  <Campo label="Dirección"    valor={paciente.direccion ?? "—"} />
                  <Campo label="Ciudad"       valor={paciente.ciudad ?? "—"} />
                </div>
              ) : (
                <Form {...editarForm}>
                  <form onSubmit={editarForm.handleSubmit(handleGuardarEdicion)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={editarForm.control} name="nombre"
                        render={({ field }) => (
                          <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={editarForm.control} name="apellido"
                        render={({ field }) => (
                          <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={editarForm.control} name="telefono"
                        render={({ field }) => (
                          <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={editarForm.control} name="telefonoEmergencia"
                        render={({ field }) => (
                          <FormItem><FormLabel>Tel. emergencia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                    </div>
                    <FormField control={editarForm.control} name="email"
                      render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={editarForm.control} name="direccion"
                        render={({ field }) => (
                          <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={editarForm.control} name="ciudad"
                        render={({ field }) => (
                          <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" size="sm" className="gap-1.5 w-full" disabled={editarForm.formState.isSubmitting}>
                      {editarForm.formState.isSubmitting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Save className="h-3.5 w-3.5" />}
                      Guardar cambios
                    </Button>
                  </form>
                </Form>
              )}

              <Separator />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resumen clínico</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <Campo label="Total citas"    valor={String(paciente.totalCitas)} />
                <Campo label="Primera cita"   valor={paciente.primeraCitaFecha ? format(parseISO(paciente.primeraCitaFecha), "dd/MM/yyyy") : "—"} />
                <Campo label="Última cita"    valor={paciente.ultimaCitaFecha   ? format(parseISO(paciente.ultimaCitaFecha),   "dd/MM/yyyy") : "—"} />
                <Campo label="Saldo pendiente" valor={paciente.saldoPendiente > 0 ? `S/ ${paciente.saldoPendiente}` : "Sin deuda"} valorClase={paciente.saldoPendiente > 0 ? "text-red-600 font-medium" : undefined} />
              </div>
            </TabsContent>

            {/* ── TAB: ANTECEDENTES ── */}
            <TabsContent value="antecedentes" className="mt-0 space-y-4 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Antecedentes médicos</h3>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMostrarFormAnt((v) => !v)}>
                  {mostrarFormAnt ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {mostrarFormAnt ? "Cancelar" : "Agregar"}
                </Button>
              </div>

              {paciente.antecedentes?.grupoSanguineo && (
                <p className="text-sm">
                  Grupo sanguíneo:{" "}
                  <span className="font-semibold text-red-600">{paciente.antecedentes.grupoSanguineo}</span>
                </p>
              )}

              {mostrarFormAnt && (
                <Form {...antecedenteForm}>
                  <form onSubmit={antecedenteForm.handleSubmit(handleGuardarAntecedente)} className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <FormField control={antecedenteForm.control} name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {Object.values(TipoAntecedente).map((t) => (
                                <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={antecedenteForm.control} name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea rows={2} className="resize-none" placeholder="Describe el antecedente..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" className="w-full" disabled={antecedenteForm.formState.isSubmitting}>
                      {antecedenteForm.formState.isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                      Guardar antecedente
                    </Button>
                  </form>
                </Form>
              )}

              <div className="space-y-2">
                {(paciente.antecedentes?.antecedentes.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin antecedentes registrados.</p>
                ) : (
                  paciente.antecedentes?.antecedentes.map((a) => (
                    <div key={a.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{a.tipo}</Badge>
                        {!a.activo && <Badge variant="outline" className="text-xs text-muted-foreground">Inactivo</Badge>}
                      </div>
                      <p className="text-sm">{a.descripcion}</p>
                      <p className="text-xs text-muted-foreground">{a.fechaRegistro}</p>
                    </div>
                  ))
                )}
              </div>

              {paciente.antecedentes?.medicamentosActuales && paciente.antecedentes.medicamentosActuales.length > 0 && (
                <>
                  <Separator />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medicamentos actuales</h3>
                  <ul className="space-y-1">
                    {paciente.antecedentes.medicamentosActuales.map((m, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>

            {/* ── TAB: ALERGIAS ── */}
            <TabsContent value="alergias" className="mt-0 space-y-4 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Alergias</h3>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMostrarFormAlergia((v) => !v)}>
                  {mostrarFormAlergia ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {mostrarFormAlergia ? "Cancelar" : "Registrar alergia"}
                </Button>
              </div>

              {tieneAlergiasGraves && (
                <Alert variant="destructive" className="border-red-300 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Este paciente tiene alergias de severidad <strong>GRAVE</strong>. Revisar antes de cualquier procedimiento.</AlertDescription>
                </Alert>
              )}

              {mostrarFormAlergia && (
                <Form {...alergiaForm}>
                  <form onSubmit={alergiaForm.handleSubmit(handleGuardarAlergia)} className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={alergiaForm.control} name="sustancia"
                        render={({ field }) => (
                          <FormItem><FormLabel>Sustancia</FormLabel><FormControl><Input placeholder="Ej. Penicilina" {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={alergiaForm.control} name="severidad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severidad</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value={SeveridadAlergia.LEVE}>Leve</SelectItem>
                                <SelectItem value={SeveridadAlergia.MODERADA}>Moderada</SelectItem>
                                <SelectItem value={SeveridadAlergia.GRAVE}>Grave</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField control={alergiaForm.control} name="reaccion"
                      render={({ field }) => (
                        <FormItem><FormLabel>Reacción</FormLabel><FormControl><Input placeholder="Describe la reacción..." {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <FormField control={alergiaForm.control} name="fechaDeteccion"
                      render={({ field }) => (
                        <FormItem><FormLabel>Fecha detección</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" className="w-full" disabled={alergiaForm.formState.isSubmitting}>
                      {alergiaForm.formState.isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                      Registrar alergia
                    </Button>
                  </form>
                </Form>
              )}

              <div className="space-y-2">
                {(paciente.antecedentes?.alergias.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin alergias registradas.</p>
                ) : (
                  paciente.antecedentes?.alergias.map((a) => (
                    <div key={a.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{a.sustancia}</span>
                        <Badge variant="outline" className={cn("text-xs border-0", SEVERIDAD_CLASE[a.severidad])}>
                          {a.severidad}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.reaccion}</p>
                      <p className="text-xs text-muted-foreground">Detectada: {a.fechaDeteccion} · Por: {a.registradoPor}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ── TAB: CONVENIO ── */}
            <TabsContent value="convenio" className="mt-0 space-y-4 pb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Convenio activo</h3>
              {paciente.convenio?.activo ? (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-teal-600" />
                    <span className="font-semibold">{paciente.convenio.nombreEntidad}</span>
                    <Badge variant="outline" className="text-xs bg-teal-100 text-teal-700 border-0">{paciente.convenio.tipo}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <Campo label="Descuento"    valor={`${paciente.convenio.porcentajeDescuento}%`} valorClase="text-teal-700 font-semibold" />
                    <Campo label="Póliza"       valor={paciente.convenio.numeroPoliza ?? "—"} mono />
                    <Campo label="Desde"        valor={paciente.convenio.vigenciaDesde} />
                    <Campo label="Hasta"        valor={paciente.convenio.vigenciaHasta ?? "Sin vencimiento"} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Este paciente no tiene convenio activo.</p>
              )}
            </TabsContent>

            {/* ── TAB: DOCUMENTOS ── */}
            <TabsContent value="documentos" className="mt-0 space-y-4 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Documentos adjuntos</h3>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMostrarFormDoc((v) => !v)}>
                  {mostrarFormDoc ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {mostrarFormDoc ? "Cancelar" : "Adjuntar"}
                </Button>
              </div>

              {mostrarFormDoc && (
                <Form {...documentoForm}>
                  <form onSubmit={documentoForm.handleSubmit(handleGuardarDocumento)} className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <FormField control={documentoForm.control} name="nombre"
                      render={({ field }) => (
                        <FormItem><FormLabel>Nombre del documento</FormLabel><FormControl><Input placeholder="Ej. Radiografía panorámica" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <FormField control={documentoForm.control} name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {Object.values(TipoDocumento).map((t) => (
                                <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={documentoForm.control} name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                          <FormControl><Input placeholder="Observaciones..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" className="w-full" disabled={documentoForm.formState.isSubmitting}>
                      {documentoForm.formState.isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                      Adjuntar documento
                    </Button>
                  </form>
                </Form>
              )}

              <div className="space-y-2">
                {paciente.documentos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin documentos adjuntos.</p>
                ) : (
                  paciente.documentos.map((d) => (
                    <div key={d.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.tipo.replace("_", " ")} · {d.tamanioKb > 0 ? `${d.tamanioKb} KB` : "—"} · {d.subidoEn} · {d.subidoPor}
                        </p>
                        {d.descripcion && <p className="text-xs text-muted-foreground italic">{d.descripcion}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ── TAB: HISTORIAL CAMBIOS ── */}
            <TabsContent value="historial" className="mt-0 space-y-3 pb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Historial de cambios</h3>
              {paciente.historialCambios.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Sin cambios registrados.</p>
              ) : (
                [...paciente.historialCambios].reverse().map((c) => (
                  <div key={c.id} className="rounded-lg border p-3 space-y-1 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.campo}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {c.modificadoEn.length > 10
                          ? format(new Date(c.modificadoEn), "dd/MM/yyyy HH:mm")
                          : c.modificadoEn}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="line-through">{c.valorAnterior || "—"}</span>
                      {" → "}
                      <span className="text-foreground font-medium">{c.valorNuevo}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Por: {c.modificadoPor}</p>
                  </div>
                ))
              )}
            </TabsContent>

          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ─── Helper Campo ──────────────────────────────────────────────────────────

function Campo({
  label,
  valor,
  mono,
  valorClase,
}: {
  label: string;
  valor: string;
  mono?: boolean;
  valorClase?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm mt-0.5", mono && "font-mono", valorClase)}>{valor}</p>
    </div>
  );
}
