"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { usePacientes } from "@/modules/pacientes/hooks/usePacientes";
import { PacienteTabla } from "@/modules/pacientes/components/PacienteTabla";
import { RegistrarPacienteModal } from "@/modules/pacientes/components/RegistrarPacienteModal";
import { PacientePerfilSheet } from "@/modules/pacientes/components/PacientePerfilSheet";
import { type Paciente, type FiltrosPacientes } from "@/modules/pacientes/types/pacientes.types";

export default function PacientesSecretariaPage() {
  const [filtros, setFiltros]           = useState<FiltrosPacientes>({});
  const [registrarAbierto, setRegistrarAbierto] = useState(false);
  const [pacienteActivo, setPacienteActivo]     = useState<Paciente | null>(null);

  const {
    pacientes,
    accionEnCurso,
    stats,
    verificarDni,
    registrarPaciente,
    editarPaciente,
    agregarAlergia,
    agregarAntecedente,
    adjuntarDocumento,
  } = usePacientes(filtros);

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground text-sm">
            {stats.total} registrados · {stats.activos} activos
          </p>
        </div>
      </div>

      {/* Tabla principal */}
      <PacienteTabla
        pacientes={pacientes}
        filtros={filtros}
        mostrarAccionesJefe={false}
        onChangeFiltros={setFiltros}
        onNuevoPaciente={() => setRegistrarAbierto(true)}
        onVerPerfil={setPacienteActivo}
        onEditar={setPacienteActivo}
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
        paciente={pacienteActivo}
        modificadoPor="Secretaria"
        onCerrar={() => setPacienteActivo(null)}
        onEditar={editarPaciente}
        onAgregarAlergia={agregarAlergia}
        onAgregarAntecedente={agregarAntecedente}
        onAdjuntarDocumento={adjuntarDocumento}
      />
    </div>
  );
}
