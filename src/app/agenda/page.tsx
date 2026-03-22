"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const days = ["Lun 20", "Mar 21", "Mie 22", "Jue 23", "Vie 24"];

const scheduledEvents = [
  { day: "Lun 20", hour: "09:00", patient: "Mateo Valdivia", type: "Limpieza", duration: 1, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { day: "Lun 20", hour: "11:00", patient: "Sofia Ruiz", type: "Extracción", duration: 1.5, color: "bg-teal-100 text-teal-700 border-teal-200" },
  { day: "Mar 21", hour: "10:00", patient: "Carlos Mendez", type: "Revisión", duration: 1, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { day: "Jue 23", hour: "14:00", patient: "Lucía Gomez", type: "Ortodoncia", duration: 1, color: "bg-purple-100 text-purple-700 border-purple-200" },
];

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda Semanal</h2>
          <p className="text-muted-foreground">Optimiza tu tiempo y gestiona las citas de todos tus especialistas.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            <LayoutGrid size={16} /> Semanal
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
            <List size={16} /> Lista
          </Button>
          <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
          <Button className="flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={18} />
            Nueva Cita
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm"><ChevronLeft size={16} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm"><ChevronRight size={16} /></Button>
            </div>
            <h3 className="font-bold text-lg">Mayo 2024</h3>
            <Badge variant="secondary" className="font-medium">Semana 21</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Filter size={16} /> Filtrar Doctores</Button>
            <Button variant="outline" size="sm" className="gap-2"><CalendarIcon size={16} /> Hoy</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Calendar Grid */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b bg-muted/30">
              <div className="p-3"></div>
              {days.map(day => (
                <div key={day} className="p-3 text-center border-l font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            <div className="relative">
              {hours.map((hour, idx) => (
                <div key={hour} className="grid grid-cols-[80px_repeat(5,1fr)] h-20 border-b relative group">
                  <div className="p-3 text-xs font-medium text-muted-foreground flex justify-center items-start pt-4">
                    {hour}
                  </div>
                  {days.map((day, dIdx) => {
                    const event = scheduledEvents.find(e => e.day === day && e.hour === hour);
                    return (
                      <div key={`${day}-${hour}`} className="border-l relative hover:bg-primary/[0.02] transition-colors">
                        {event && (
                          <div 
                            className={cn(
                              "absolute inset-1 rounded-xl p-2 text-[10px] font-bold border-l-4 shadow-sm z-10 overflow-hidden",
                              event.color
                            )}
                            style={{ height: `calc(${event.duration} * 5rem - 0.5rem)` }}
                          >
                            <div className="truncate">{event.patient}</div>
                            <div className="opacity-80 font-normal truncate">{event.type}</div>
                          </div>
                        )}
                        {!event && (
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                            <Plus size={12} className="text-primary/30" />
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Current Time Indicator */}
              <div className="absolute top-[18%] left-0 right-0 border-t-2 border-primary/50 z-20 pointer-events-none">
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
