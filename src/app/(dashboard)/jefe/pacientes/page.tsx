"use client";

import { useState } from "react";
import { AlertTriangle, Users } from "lucide-react";
import { usePacientes } from "@/modules/pacientes/hooks/usePacientes";
import { PacienteTabla } from "@/modules/pacientes/components/PacienteTabla";
import { RegistrarPacienteModal } from "@/modules/pacientes/components/RegistrarPacienteModal";
import { PacientePerfilSheet } from "@/modules/pacientes/components/PacientePerfilSheet";
import { ClasificarEstadoModal } from "@/modules/pacientes/components/ClasificarEstadoModal";
import { ConvenioModal } from "@/modules/pacientes/components/ConvenioModal";
import { type Paciente, type FiltrosPacientes } from "@/modules/pacientes/types/pacientes.types";

export default function PacientesJefePage() {
  const [filtros, setFiltros]                       = useState<FiltrosPacientes>({});
  const [registrarAbierto, setRegistrarAbierto]     = useState(false);
  const [pacienteActivo, setPacienteActivo]         = useState<Paciente | null>(null);
  const [pacienteClasificar, setPacienteClasificar] = useState<Paciente | null>(null);
  const [pacienteConvenio, setPacienteConvenio]     = useState<Paciente | null>(null);

  const {
    pacientes,
    todosPacientes,
    stats,
    verificarDni,
    registrarPaciente,
    editarPaciente,
    clasificarPaciente,
    guardarAnamnesis,
    agregarAlergia,
    agregarAntecedente,
    guardarConvenio,
    adjuntarDocumento,
    exportarFicha,
  } = usePacientes(filtros);

  // Mantiene el paciente activo sincronizado cuando el hook actualiza su estado
  const pacienteActivoSync     = pacienteActivo
    ? (todosPacientes.find((p) => p.id === pacienteActivo.id) ?? pacienteActivo)
    : null;
  const pacienteClasificarSync = pacienteClasificar
    ? (todosPacientes.find((p) => p.id === pacienteClasificar.id) ?? pacienteClasificar)
    : null;
  const pacienteConvenioSync   = pacienteConvenio
    ? (todosPacientes.find((p) => p.id === pacienteConvenio.id) ?? pacienteConvenio)
    : null;

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de pacientes</h2>
          <p className="text-muted-foreground text-sm">
            {stats.total} registrados · {stats.activos} activos · {stats.morosos} morosos · {stats.convenio} con convenio
          </p>
        </div>
      </div>

      {/* Alertas resumen */}
      {stats.morosos > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{stats.morosos}</strong> paciente{stats.morosos !== 1 ? "s" : ""} con saldo pendiente.
          </span>
        </div>
      )}

      {/* Tabla con acciones de jefe activadas */}
      <PacienteTabla
        pacientes={pacientes}
        filtros={filtros}
        mostrarAccionesJefe={true}
        onChangeFiltros={setFiltros}
        onNuevoPaciente={() => setRegistrarAbierto(true)}
        onVerPerfil={setPacienteActivo}
        onEditar={setPacienteActivo}
        onClasificar={setPacienteClasificar}
        onExportar={exportarFicha}
      />

      {/* Modal registrar */}
      <RegistrarPacienteModal
        abierto={registrarAbierto}
        onCerrar={() => setRegistrarAbierto(false)}
        onRegistrar={registrarPaciente}
        verificarDni={verificarDni}
        onVerPerfil={(p) => {
          setRegistrarAbierto(false);
          setPacienteActivo(p);
        }}
      />

      {/* Sheet perfil */}
      <PacientePerfilSheet
        abierto={!!pacienteActivo}
        paciente={pacienteActivoSync}
        modificadoPor="Dr. Jefe"
        onCerrar={() => setPacienteActivo(null)}
        onEditar={editarPaciente}
        onAgregarAlergia={agregarAlergia}
        onAgregarAntecedente={agregarAntecedente}
        onAdjuntarDocumento={adjuntarDocumento}
        onGuardarAnamnesis={guardarAnamnesis}
      />

      {/* Modal clasificar estado */}
      <ClasificarEstadoModal
        abierto={!!pacienteClasificar}
        paciente={pacienteClasificarSync}
        onCerrar={() => setPacienteClasificar(null)}
        onClasificar={async (dto) => {
          await clasificarPaciente(dto, "Dr. Jefe");
          setPacienteClasificar(null);
        }}
      />

      {/* Modal convenio */}
      <ConvenioModal
        abierto={!!pacienteConvenio}
        paciente={pacienteConvenioSync}
        onCerrar={() => setPacienteConvenio(null)}
        onGuardarConvenio={async (dto) => {
          await guardarConvenio(dto);
          setPacienteConvenio(null);
        }}
      />
    </div>
  );
}
