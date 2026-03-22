"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Odontogram } from "@/components/odontogram/Odontogram";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar, Clock, Plus, Download } from "lucide-react";
import React from 'react';

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  // Mock data for a single patient
  const patient = {
    id: params.id || "P-001",
    name: "Mateo Valdivia",
    age: 28,
    bloodType: "O+",
    phone: "+591 76543210",
    email: "mateo.val@email.com",
    address: "Av. Las Americas #123, Santa Cruz",
    diagnoses: [
      { date: "2024-05-10", condition: "Gingivitis Leve", status: "En Tratamiento" },
      { date: "2024-03-15", condition: "Caries Oclusal Pieza 4", status: "Resuelto" }
    ],
    appointments: [
      { date: "2024-05-10", time: "09:00 AM", doctor: "Dr. Rivera", reason: "Limpieza Dental" },
      { date: "2024-03-15", time: "11:00 AM", doctor: "Dr. Rivera", reason: "Resina" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-xl">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold tracking-tight">{patient.name}</h2>
              <Badge variant="outline" className="h-6">ID: {patient.id}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar size={14} /> {patient.age} años</span>
              <span className="flex items-center gap-1 font-bold text-primary">RH: {patient.bloodType}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {patient.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} /> Exportar EHR
          </Button>
          <Button size="sm" className="gap-2">
            <Plus size={16} /> Nueva Receta
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clinical" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="clinical" className="px-6">Historia Clínica</TabsTrigger>
          <TabsTrigger value="odontogram" className="px-6">Odontograma</TabsTrigger>
          <TabsTrigger value="appointments" className="px-6">Agenda</TabsTrigger>
          <TabsTrigger value="files" className="px-6">Estudios / Imágenes</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="space-y-4 pt-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle>Resumen de Diagnósticos</CardTitle>
                <CardDescription>Seguimiento de condiciones clínicas actuales.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.diagnoses.map((diag, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                      <div>
                        <p className="font-bold text-sm">{diag.condition}</p>
                        <p className="text-xs text-muted-foreground">Diagnosticado el {diag.date}</p>
                      </div>
                      <Badge variant={diag.status === "Resuelto" ? "secondary" : "default"}>
                        {diag.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 text-primary h-4 w-4" />
                  <div>
                    <p className="font-semibold">Correo Electrónico</p>
                    <p className="text-muted-foreground">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 text-primary h-4 w-4" />
                  <div>
                    <p className="font-semibold">Dirección</p>
                    <p className="text-muted-foreground">{patient.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="odontogram" className="pt-4">
          <Odontogram />
        </TabsContent>

        <TabsContent value="appointments" className="pt-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Historial de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.appointments.map((appt, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/5 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary leading-tight">
                      <span className="text-xs font-bold uppercase">{appt.date.split('-')[1]}</span>
                      <span className="text-lg font-bold">{appt.date.split('-')[2]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{appt.reason}</p>
                      <p className="text-xs text-muted-foreground">Atendido por {appt.doctor} • {appt.time}</p>
                    </div>
                    <Button variant="ghost" size="sm">Ver Detalles</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
