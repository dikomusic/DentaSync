"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Filter, MoreHorizontal, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const patients = [
  { id: "P-001", name: "Mateo Valdivia", lastVisit: "2024-05-10", status: "Activo", phone: "+591 76543210" },
  { id: "P-002", name: "Sofia Ruiz", lastVisit: "2024-05-12", status: "Activo", phone: "+591 71234567" },
  { id: "P-003", name: "Carlos Mendez", lastVisit: "2024-04-20", status: "Inactivo", phone: "+591 70001122" },
  { id: "P-004", name: "Lucía Gomez", lastVisit: "2024-05-01", status: "Activo", phone: "+591 79988776" },
  { id: "P-005", name: "Elena Torres", lastVisit: "2023-12-15", status: "Inactivo", phone: "+591 61122334" },
];

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Directorio de Pacientes</h2>
          <p className="text-muted-foreground">Gestiona los expedientes clínicos y la información de tus pacientes.</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus size={18} />
          Nuevo Paciente
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="text-muted-foreground h-4 w-4 absolute ml-3" />
              <Input placeholder="Buscar por nombre, ID o teléfono..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Última Cita</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} className="group">
                  <TableCell className="font-mono text-xs">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="text-muted-foreground">{patient.phone}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    <Badge variant={patient.status === "Activo" ? "default" : "secondary"}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/patients/${patient.id}`}>
                          <FileText size={18} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
