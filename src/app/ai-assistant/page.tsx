"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles, Wand2, Send, MessageSquare, ListRestart, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { optimizeDentistSchedule } from "@/ai/flows/dentist-schedule-optimizer";
import { patientAppointmentAssistant } from "@/ai/flows/patient-appointment-assistant-flow";
import { useToast } from "@/hooks/use-toast";

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hola, soy DentaSync AI. ¿En qué puedo ayudarte hoy con la gestión de tu consultorio o tus pacientes?" }
  ]);

  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleOptimization = async () => {
    setLoading(true);
    try {
      const result = await optimizeDentistSchedule({
        dentistId: "DR-001",
        currentSchedule: [
          { date: "2024-05-20", time: "09:00", patientId: "P-001", treatmentType: "Limpieza" },
          { date: "2024-05-20", time: "11:30", patientId: "P-002", treatmentType: "Extracción" }
        ],
        patientProfiles: [
          { patientId: "P-001", name: "Mateo Valdivia", preferredTimeSlots: ["morning"], noShowRate: 5 },
          { patientId: "P-002", name: "Sofia Ruiz", preferredTimeSlots: ["afternoon"], noShowRate: 2 }
        ],
        availableTimeSlots: [
          { date: "2024-05-20", startTime: "10:00", endTime: "11:00" }
        ],
        standardTreatmentDurations: { "Limpieza": 30, "Extracción": 60 }
      });
      setOptimizationResult(result);
      toast({ title: "Agenda Optimizada", description: "La IA ha generado sugerencias para mejorar tu flujo de trabajo." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo completar la optimización." });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    
    try {
      const result = await patientAppointmentAssistant({
        patientId: "patient-123",
        query: userMsg
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error procesando tu solicitud." }]);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto h-[calc(100vh-12rem)]">
      {/* Left side: AI Schedule Optimizer */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6" />
            Optimizador de Agenda
          </h2>
          <p className="text-muted-foreground text-sm">Analiza y reasigna turnos para reducir tiempos muertos.</p>
        </div>

        <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              Configuración de Escaneo
              <Button size="sm" onClick={handleOptimization} disabled={loading} className="gap-2">
                <Wand2 size={16} />
                {loading ? "Analizando..." : "Ejecutar IA"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-auto">
            {optimizationResult ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <h4 className="font-bold text-green-800 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} />
                    Informe de Eficiencia
                  </h4>
                  <p className="text-xs text-green-700 leading-relaxed">{optimizationResult.efficiencyReport}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-muted-foreground">Cronograma Sugerido</h4>
                  {optimizationResult.optimizedSchedule.map((appt: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border bg-white flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{appt.time}</Badge>
                        <span className="font-medium">{appt.treatmentType}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{appt.assignedDurationMinutes} min</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-muted-foreground">Sugerencias Adicionales</h4>
                  <ul className="space-y-2">
                    {optimizationResult.suggestions.map((sug: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-2 bg-accent/5 p-2 rounded">
                        <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bot size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">IA Lista para Escanear</h3>
                  <p className="text-sm text-muted-foreground">Haz clic en "Ejecutar IA" para analizar tu agenda de los próximos 7 días y encontrar mejoras de eficiencia.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right side: Patient Assistant Chat */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-accent h-6 w-6" />
            Asistente de Pacientes
          </h2>
          <p className="text-muted-foreground text-sm">Chatbot inteligente para dudas, citas y recordatorios.</p>
        </div>

        <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden bg-muted/10">
          <CardHeader className="bg-white border-b py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">DentaSync Chat</CardTitle>
                <CardDescription className="text-[10px]">IA Conectada a tu Clínica</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-white shadow-sm border rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 bg-white border-t">
              <form 
                className="flex gap-2" 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              >
                <Input 
                  placeholder="Escribe una consulta de prueba..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="bg-muted/30 border-none h-11"
                />
                <Button size="icon" className="h-11 w-11 shrink-0 bg-accent hover:bg-accent/90" type="submit">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
