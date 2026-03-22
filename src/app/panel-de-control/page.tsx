"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, TrendingUp, Clock, ChevronRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const estadisticas = [
  { label: "Citas Hoy", value: "12", icon: CalendarDays, tendencia: "+2", color: "text-blue-600" },
  { label: "Pacientes Activos", value: "842", icon: Users, tendencia: "+14", color: "text-teal-600" },
  { label: "Eficiencia", value: "94%", icon: TrendingUp, tendencia: "+3%", color: "text-green-600" },
  { label: "Espera Promedio", value: "8 min", icon: Clock, tendencia: "-2 min", color: "text-orange-600" },
];

export default function PaginaPrincipal() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bienvenido, Dr. Rivera</h2>
        <p className="text-muted-foreground">Resumen de la jornada clínica de hoy.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {estadisticas.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.tendencia}</span> este mes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm bg-primary text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" /> Asistente DentaSync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="opacity-90">He encontrado 3 espacios disponibles que pueden optimizarse para mañana.</p>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/asistente-ia">Ir al Asistente</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
