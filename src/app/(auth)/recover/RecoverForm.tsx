"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ─── Schema de validación ──────────────────────────────────────────────────
const recoverSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
});

type RecoverFormValues = z.infer<typeof recoverSchema>;

// ─── Componente ────────────────────────────────────────────────────────────
export function RecoverForm() {
  const [enviado, setEnviado] = useState(false);

  const form = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(_values: RecoverFormValues) {
    // Simular delay de red — no se revela si el email existe o no
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO: Llamar al backend NestJS: POST /auth/recover-password
    // await apiClient.post("/auth/recover-password", { email: values.email })
    // La respuesta siempre es exitosa para no revelar si el email está registrado

    setEnviado(true);
  }

  // Pantalla de confirmación — mensaje idéntico independientemente del email
  if (enviado) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Revisa tu correo</h2>
          <p className="text-sm text-muted-foreground">
            Si ese email está registrado en DentaSync,
            recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          El enlace expira en 30 minutos. Revisa también tu carpeta de spam.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Recuperar acceso</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="doctor@consultorio.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>
      </Form>

      {/* Volver al login */}
      <div className="text-center">
        <Link
          href="/login"
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
