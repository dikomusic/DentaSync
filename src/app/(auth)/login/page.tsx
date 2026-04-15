import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "DentaSync — Iniciar Sesión",
  description: "Accede a tu consultorio dental",
};

export default function LoginPage() {
  return (
    <Card className="shadow-lg">
      <CardContent className="pt-8 pb-6 px-6">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
