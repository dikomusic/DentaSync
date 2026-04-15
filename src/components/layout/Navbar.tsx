"use client";

import { LogOut, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABEL } from "@/types/roles.types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  titulo?: string;
}

export function Navbar({ titulo }: NavbarProps) {
  const { usuario, rol, cerrarSesion } = useAuth();

  // Iniciales del usuario para el avatar
  const iniciales = usuario
    ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()
    : "??";

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Usuario";

  const etiquetaRol = rol ? ROLE_LABEL[rol] : "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {/* Título de la página actual (offset para el botón hamburguesa en mobile) */}
      <div className="ml-12 md:ml-0">
        {titulo && (
          <h1 className="text-base font-semibold text-foreground">{titulo}</h1>
        )}
      </div>

      {/* Acciones del header */}
      <div className="flex items-center gap-2">
        {/* Botón de notificaciones */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Badge de notificaciones no leídas */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                {usuario?.avatarUrl && (
                  <AvatarImage src={usuario.avatarUrl} alt={nombreCompleto} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {iniciales}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium leading-none">{nombreCompleto}</span>
                <span className="mt-0.5 text-xs text-muted-foreground">{etiquetaRol}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{nombreCompleto}</span>
                <span className="mt-0.5 text-xs font-normal text-muted-foreground">
                  {usuario?.email}
                </span>
                <Badge variant="secondary" className="mt-1 w-fit text-xs">
                  {etiquetaRol}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={cerrarSesion}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
