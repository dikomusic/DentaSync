"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserRole, ROLE_DEFAULT_ROUTE } from "@/types/roles.types";

// ─── Schema de validación ──────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Componente ────────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    setErrorGeneral(null);

    // signIn con redirect:false para manejar el redirect manualmente según rol
    const resultado = await signIn("credentials", {
      email:    values.email,
      password: values.password,
      redirect: false,
    });

    // Credenciales rechazadas — mensaje genérico sin revelar cuál campo falló
    if (!resultado?.ok || resultado.error) {
      setErrorGeneral("Credenciales incorrectas. Verifica tu email y contraseña.");
      return;
    }

    // Leer la sesión para obtener el rol y redirigir al dashboard correcto
    const sesion = await getSession();
    const rol = sesion?.user?.role as UserRole | undefined;

    if (rol && ROLE_DEFAULT_ROUTE[rol]) {
      router.push(ROLE_DEFAULT_ROUTE[rol]);
      router.refresh();
    } else {
      // Fallback: el middleware se encarga del redirect final
      router.push("/");
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder a tu consultorio
        </p>
      </div>

      {/* Error general */}
      {errorGeneral && (
        <Alert variant="destructive">
          <AlertDescription>{errorGeneral}</AlertDescription>
        </Alert>
      )}

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email */}
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

          {/* Contraseña */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Contraseña</FormLabel>
                  <Link
                    href="/recover"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    tabIndex={-1}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={mostrarPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {mostrarPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón de submit con estado de carga */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Form>

      {/* Usuarios demo — solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-md border border-dashed p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Usuarios demo (contraseña: Demo1234!)
          </p>
          <div className="grid grid-cols-1 gap-1">
            {[
              { email: "super@dentasync.com",      label: "Super Admin" },
              { email: "jefe@dentasync.com",        label: "Doctor Jefe" },
              { email: "doctor@dentasync.com",      label: "Doctor" },
              { email: "secretaria@dentasync.com",  label: "Secretaria" },
              { email: "paciente@dentasync.com",    label: "Paciente" },
            ].map(({ email, label }) => (
              <button
                key={email}
                type="button"
                onClick={() => {
                  form.setValue("email", email);
                  form.setValue("password", "Demo1234!");
                }}
                className="text-left text-xs text-muted-foreground hover:text-foreground"
              >
                → {label}: {email}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
