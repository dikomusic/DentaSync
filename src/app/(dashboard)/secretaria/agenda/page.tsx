"use client";

import { useState } from "react";
import { CalendarDays, Clock, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCitas, useListaEspera } from "@/modules/agenda/hooks/useAgenda";
import { CalendarioVista } from "@/modules/agenda/components/CalendarioVista";
import { NuevaCitaModal } from "@/modules/agenda/components/NuevaCitaModal";
import { CancelarCitaModal } from "@/modules/agenda/components/CancelarCitaModal";
import { ReprogramarCitaModal } from "@/modules/agenda/components/ReprogramarCitaModal";
import { ListaEsperaModal } from "@/modules/agenda/components/ListaEsperaModal";
import { type Cita, type FiltrosAgenda, EstadoCita } from "@/modules/agenda/types/agenda.types";

export default function AgendaSecretariaPage() {
  // ── Estado de modales ──
  const [filtros]                                   = useState<FiltrosAgenda>({});
  const [nuevaCitaAbierto, setNuevaCitaAbierto]     = useState(false);
  const [listaEsperaAbierto, setListaEsperaAbierto] = useState(false);
  const [citaACancelar, setCitaACancelar]           = useState<Cita | null>(null);
  const [citaAReprogramar, setCitaAReprogramar]     = useState<Cita | null>(null);

  // ── Estado del calendario ──
  const [fechaActiva] = useState<Date>(new Date());
  const [vista, setVista]             = useState<"dia" | "semana" | "lista">("dia");

  // ── Hooks de datos ──
  const {
    citas: citasFiltradas,
    todasLasCitas,
    accionEnCurso,
    crearCita,
    marcarAsistencia,
    cancelarCita,
    reprogramarCita,
  } = useCitas(filtros);

  const { listaEspera, agregar: agregarListaEspera, eliminar: eliminarListaEspera } = useListaEspera();

  // ── Resumen del día ──
  const hoy        = new Date().toISOString().split("T")[0];
  const citasHoy   = todasLasCitas.filter((c) => c.fecha === hoy);
  const pendientes = citasHoy.filter((c) => c.estado === EstadoCita.PENDIENTE || c.estado === EstadoCita.CONFIRMADA).length;
  const enConsulta = citasHoy.filter((c) => c.estado === EstadoCita.EN_CONSULTA).length;

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground text-sm">Gestión de citas y disponibilidad del consultorio</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setListaEsperaAbierto(true)}>
            <Users className="h-4 w-4" />
            Lista de espera
            {listaEspera.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {listaEspera.length}
              </Badge>
            )}
          </Button>

          <Button className="gap-2" onClick={() => setNuevaCitaAbierto(true)}>
            <Plus className="h-4 w-4" />
            Nueva cita
          </Button>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResumenCard icon={<CalendarDays className="h-4 w-4" />} label="Citas hoy"   valor={citasHoy.length}    color="text-primary" />
        <ResumenCard icon={<Clock className="h-4 w-4" />}        label="Pendientes"  valor={pendientes}         color="text-yellow-600" />
        <ResumenCard icon={<Users className="h-4 w-4" />}        label="En consulta" valor={enConsulta}         color="text-blue-600" />
        <ResumenCard icon={<Users className="h-4 w-4" />}        label="En espera"   valor={listaEspera.length} color="text-muted-foreground" />
      </div>

      {/* Calendario */}
      <CalendarioVista
        citas={citasFiltradas}
        fechaActiva={fechaActiva}
        vista={vista}
        accionEnCurso={accionEnCurso}
        onCambiarVista={setVista}
        onNuevaEnSlot={() => setNuevaCitaAbierto(true)}
        onMarcarAsistencia={marcarAsistencia}
        onCancelar={setCitaACancelar}
        onReprogramar={setCitaAReprogramar}
      />

      {/* ── Modales ── */}

      <NuevaCitaModal
        abierto={nuevaCitaAbierto}
        todasLasCitas={todasLasCitas}
        onCerrar={() => setNuevaCitaAbierto(false)}
        onCrear={async (dto) => {
          await crearCita(dto);
          setNuevaCitaAbierto(false);
        }}
      />

      <CancelarCitaModal
        abierto={!!citaACancelar}
        cita={citaACancelar}
        onCerrar={() => setCitaACancelar(null)}
        onConfirmar={async (citaId, motivo) => {
          await cancelarCita({ citaId, motivoCancelacion: motivo });
          setCitaACancelar(null);
        }}
      />

      <ReprogramarCitaModal
        abierto={!!citaAReprogramar}
        cita={citaAReprogramar}
        todasLasCitas={todasLasCitas}
        onCerrar={() => setCitaAReprogramar(null)}
        onConfirmar={async (citaId, nuevaFecha, nuevaHora) => {
          await reprogramarCita({ citaId, nuevaFecha, nuevaHora });
          setCitaAReprogramar(null);
        }}
      />

      <ListaEsperaModal
        abierto={listaEsperaAbierto}
        listaEspera={listaEspera}
        onCerrar={() => setListaEsperaAbierto(false)}
        onAgregar={agregarListaEspera}
        onEliminar={eliminarListaEspera}
      />
    </div>
  );
}

// ─── Tarjeta resumen ───────────────────────────────────────────────────────

function ResumenCard({
  icon, label, valor, color,
}: {
  icon: React.ReactNode;
  label: string;
  valor: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{valor}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}
