"use client";

import { Search, Filter, UserPlus, MoreHorizontal, Eye, Edit2, FileDown, Shield } from "lucide-react";
import { format, differenceInYears, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  type FiltrosPacientes,
  EstadoPaciente,
  ClasificacionPaciente,
} from "../types/pacientes.types";

// ─── Configuración visual ─────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoPaciente, { label: string; clase: string }> = {
  [EstadoPaciente.ACTIVO]:     { label: "Activo",     clase: "bg-green-100 text-green-700" },
  [EstadoPaciente.INACTIVO]:   { label: "Inactivo",   clase: "bg-gray-100 text-gray-600" },
  [EstadoPaciente.MOROSO]:     { label: "Moroso",     clase: "bg-red-100 text-red-700" },
  [EstadoPaciente.SUSPENDIDO]: { label: "Suspendido", clase: "bg-orange-100 text-orange-700" },
};

const CLASIFICACION_CONFIG: Record<ClasificacionPaciente, { label: string; clase: string }> = {
  [ClasificacionPaciente.NUEVO]:    { label: "Nuevo",    clase: "bg-blue-100 text-blue-700" },
  [ClasificacionPaciente.REGULAR]:  { label: "Regular",  clase: "border border-border text-muted-foreground" },
  [ClasificacionPaciente.VIP]:      { label: "VIP",      clase: "bg-purple-100 text-purple-700" },
  [ClasificacionPaciente.CONVENIO]: { label: "Convenio", clase: "bg-teal-100 text-teal-700" },
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface PacienteTablaProps {
  pacientes:          Paciente[];
  filtros:            FiltrosPacientes;
  mostrarAccionesJefe?: boolean;
  onChangeFiltros:    (filtros: FiltrosPacientes) => void;
  onNuevoPaciente:    () => void;
  onVerPerfil:        (paciente: Paciente) => void;
  onEditar:           (paciente: Paciente) => void;
  onClasificar?:      (paciente: Paciente) => void;
  onExportar?:        (paciente: Paciente) => void;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function PacienteTabla({
  pacientes,
  filtros,
  mostrarAccionesJefe = false,
  onChangeFiltros,
  onNuevoPaciente,
  onVerPerfil,
  onEditar,
  onClasificar,
  onExportar,
}: PacienteTablaProps) {
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, teléfono o email..."
            className="pl-9"
            value={filtros.busqueda ?? ""}
            onChange={(e) => onChangeFiltros({ ...filtros, busqueda: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filtros.estado || "TODOS"}
            onValueChange={(v) => onChangeFiltros({ ...filtros, estado: v === "TODOS" ? "" : v as EstadoPaciente })}
          >
            <SelectTrigger className="w-36">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los estados</SelectItem>
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filtros.clasificacion || "TODOS"}
            onValueChange={(v) => onChangeFiltros({ ...filtros, clasificacion: v === "TODOS" ? "" : v as ClasificacionPaciente })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los tipos</SelectItem>
              {Object.entries(CLASIFICACION_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={onNuevoPaciente} className="gap-2 shrink-0">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo paciente</span>
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Paciente</TableHead>
              <TableHead className="hidden md:table-cell">DNI</TableHead>
              <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Clasificación</TableHead>
              <TableHead className="hidden xl:table-cell">Última cita</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Saldo</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {pacientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No se encontraron pacientes con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              pacientes.map((paciente) => {
                const estadoCfg = ESTADO_CONFIG[paciente.estado];
                const clasCfg   = CLASIFICACION_CONFIG[paciente.clasificacion];
                const edad      = differenceInYears(new Date(), parseISO(paciente.fechaNacimiento));
                const tieneAlergiasGraves = paciente.antecedentes?.alergias.some(
                  (a) => a.severidad === "GRAVE"
                );

                return (
                  <TableRow
                    key={paciente.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => onVerPerfil(paciente)}
                  >
                    {/* Nombre + avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          paciente.estado === EstadoPaciente.MOROSO
                            ? "bg-red-100 text-red-700"
                            : "bg-primary/10 text-primary"
                        )}>
                          {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-none">
                            {paciente.nombre} {paciente.apellido}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {edad} años · {paciente.genero === "M" ? "Masculino" : paciente.genero === "F" ? "Femenino" : "Otro"}
                            {tieneAlergiasGraves && (
                              <span className="ml-1.5 text-red-600 font-medium">⚠ Alergia grave</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* DNI */}
                    <TableCell className="hidden md:table-cell text-sm font-mono">
                      {paciente.dni}
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {paciente.telefono}
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs border-0", estadoCfg.clase)}>
                        {estadoCfg.label}
                      </Badge>
                    </TableCell>

                    {/* Clasificación */}
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={cn("text-xs", clasCfg.clase)}>
                        {clasCfg.label}
                      </Badge>
                    </TableCell>

                    {/* Última cita */}
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {paciente.ultimaCitaFecha
                        ? format(parseISO(paciente.ultimaCitaFecha), "dd/MM/yyyy")
                        : "—"}
                    </TableCell>

                    {/* Saldo */}
                    <TableCell className="hidden lg:table-cell text-right text-sm">
                      {paciente.saldoPendiente > 0 ? (
                        <span className="text-red-600 font-medium">
                          S/ {paciente.saldoPendiente}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onVerPerfil(paciente)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil completo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditar(paciente)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar datos
                          </DropdownMenuItem>

                          {mostrarAccionesJefe && (
                            <>
                              <DropdownMenuSeparator />
                              {onClasificar && (
                                <DropdownMenuItem onClick={() => onClasificar(paciente)}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Clasificar estado
                                </DropdownMenuItem>
                              )}
                              {onExportar && (
                                <DropdownMenuItem onClick={() => onExportar(paciente)}>
                                  <FileDown className="mr-2 h-4 w-4" />
                                  Exportar ficha
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pie de tabla */}
      <p className="text-xs text-muted-foreground">
        Mostrando {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""}
        {filtros.busqueda || filtros.estado || filtros.clasificacion ? " con los filtros aplicados" : ""}
      </p>
    </div>
  );
}
