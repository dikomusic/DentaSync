"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Smartphone } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">Administra las preferencias de tu cuenta y de la clínica.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} className="text-primary" />
              Perfil Profesional
            </CardTitle>
            <CardDescription>Actualiza tu información pública y datos de contacto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input defaultValue="Dr. Rivera" />
              </div>
              <div className="space-y-2">
                <Label>Especialidad</Label>
                <Input defaultValue="Odontología General" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input defaultValue="dr.rivera@dentasync.com" type="email" />
            </div>
            <Button className="mt-2">Guardar Cambios</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configura cómo quieres recibir las alertas de citas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Recordatorios por Email</p>
                <p className="text-xs text-muted-foreground">Enviar aviso 24h antes de cada cita.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Mensajes SMS</p>
                <p className="text-xs text-muted-foreground">Alertas inmediatas para cancelaciones.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Seguridad
            </CardTitle>
            <CardDescription>Protege el acceso a los expedientes de tus pacientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Autenticación de Dos Pasos</p>
                <p className="text-xs text-muted-foreground">Añade una capa extra de seguridad.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline">Cambiar Contraseña</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
