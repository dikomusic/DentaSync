"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, TrendingUp, Clock, ChevronRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const stats = [
  { label: "Citas Hoy", value: "12", icon: CalendarDays, trend: "+2", color: "text-blue-600" },
  { label: "Pacientes Activos", value: "842", icon: Users, trend: "+14", color: "text-teal-600" },
  { label: "Eficiencia de Agenda", value: "94%", icon: TrendingUp, trend: "+3%", color: "text-green-600" },
  { label: "Tiempo de Espera", value: "8 min", icon: Clock, trend: "-2 min", color: "text-orange-600" },
];

const todayAppointments = [
  { id: 1, patient: "Mateo Valdivia", type: "Limpieza Dental", time: "09:00 AM", status: "Confirmado" },
  { id: 2, patient: "Sofia Ruiz", type: "Resina Estética", time: "10:30 AM", status: "En Sala" },
  { id: 3, patient: "Carlos Mendez", type: "Revisión Post-Op", time: "11:15 AM", status: "Pendiente" },
  { id: 4, patient: "Lucía Gomez", type: "Ortodoncia Control", time: "02:00 PM", status: "Confirmado" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo, Dr. Rivera</h2>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu jornada para hoy.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Ver Reportes</Button>
          <Button>Nueva Cita</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend.startsWith('+') ? "text-green-600" : "text-red-600"}>
                  {stat.trend}
                </span>{" "}
                desde el último mes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>Pacientes programados para el resto del día.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {appt.patient.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{appt.patient}</p>
                      <p className="text-xs text-muted-foreground">{appt.type}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium">{appt.time}</p>
                      <Badge variant={appt.status === "Confirmado" ? "default" : appt.status === "En Sala" ? "secondary" : "outline"} className="text-[10px] h-5">
                        {appt.status}
                      </Badge>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-primary" asChild>
              <Link href="/agenda">Ver agenda completa</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              DentaSync AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm leading-relaxed opacity-90">
              He detectado una oportunidad de optimización para mañana. Dos citas de limpieza pueden consolidarse para abrir un espacio de 1 hora.
            </p>
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Impacto Estimado</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">+15%</p>
                  <p className="text-[10px] opacity-70">Rentabilidad Diaria</p>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">-20m</p>
                  <p className="text-[10px] opacity-70">Tiempos Muertos</p>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
              Optimizar Agenda
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
