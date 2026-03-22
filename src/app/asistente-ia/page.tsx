"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles, Wand2, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { optimizarAgendaDentista } from "@/ai/flujos/optimizador-agenda-dentista";
import { asistenteCitasPaciente } from "@/ai/flujos/asistente-citas-paciente";
import { useToast } from "@/hooks/use-toast";

export default function PaginaAsistenteIA() {
  const { toast } = useToast();
  const [cargando, setCargando] = useState(false);
  const [entradaChat, setEntradaChat] = useState("");
  const [historialChat, setHistorialChat] = useState<{rol: 'usuario' | 'asistente', contenido: string}[]>([
    { rol: 'asistente', contenido: "Hola, soy DentaSync IA. ¿En qué puedo ayudarte hoy?" }
  ]);

  const [resultadoOptimizacion, setResultadoOptimizacion] = useState<any>(null);

  const manejarOptimizacion = async () => {
    setCargando(true);
    try {
      const result = await optimizarAgendaDentista({
        dentistaId: "DR-001",
        agendaActual: [
          { fecha: "2024-05-20", hora: "09:00", pacienteId: "P-001", tipoTratamiento: "Limpieza" },
        ],
        perfilesPacientes: [
          { pacienteId: "P-001", nombre: "Mateo Valdivia", franjasPreferidas: ["mañana"] },
        ],
        espaciosDisponibles: [
          { fecha: "2024-05-20", horaInicio: "10:00", horaFin: "11:00" }
        ],
        duracionesEstandar: { "Limpieza": 30 }
      });
      setResultadoOptimizacion(result);
      toast({ title: "Agenda Optimizada", description: "Se han generado sugerencias de eficiencia." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo optimizar la agenda." });
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvioMensaje = async () => {
    if (!entradaChat.trim()) return;
    const msgUsuario = entradaChat;
    setEntradaChat("");
    setHistorialChat(prev => [...prev, { rol: 'usuario', contenido: msgUsuario }]);
    
    try {
      const result = await asistenteCitasPaciente({
        pacienteId: "paciente-123",
        consulta: msgUsuario
      });
      setHistorialChat(prev => [...prev, { rol: 'asistente', contenido: result.respuesta }]);
    } catch (error) {
      setHistorialChat(prev => [...prev, { rol: 'asistente', contenido: "Hubo un error al procesar tu mensaje." }]);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex flex-col gap-6 overflow-hidden">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" /> Optimizador de Agenda
        </h2>
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              Configuración IA
              <Button size="sm" onClick={manejarOptimizacion} disabled={cargando}>
                <Wand2 size={16} className="mr-2" /> {cargando ? "Procesando..." : "Ejecutar IA"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-auto">
            {resultadoOptimizacion ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-bold text-green-800 flex items-center gap-2"><CheckCircle2 size={16}/> Informe</h4>
                  <p className="text-sm text-green-700">{resultadoOptimizacion.informeEficiencia}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-muted-foreground">Sugerencias</h4>
                  {resultadoOptimizacion.agendaOptimizada.map((item: any, i: number) => (
                    <div key={i} className="p-3 border rounded-lg bg-white text-sm">
                      <Badge className="mr-2">{item.hora}</Badge> {item.tipoTratamiento}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot size={48} className="text-primary/20 mb-4" />
                <p>Haz clic para optimizar los turnos del consultorio.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 overflow-hidden">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="text-accent h-6 w-6" /> Asistente de Pacientes
        </h2>
        <Card className="flex-1 flex flex-col bg-muted/10 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {historialChat.map((msg, i) => (
                <div key={i} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.rol === 'usuario' ? 'bg-primary text-white' : 'bg-white shadow-sm border'}`}>
                    {msg.contenido}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 bg-white border-t">
            <form onSubmit={(e) => { e.preventDefault(); manejarEnvioMensaje(); }} className="flex gap-2">
              <Input placeholder="Pregunta algo..." value={entradaChat} onChange={(e) => setEntradaChat(e.target.value)} />
              <Button size="icon" type="submit"><Send size={18} /></Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
