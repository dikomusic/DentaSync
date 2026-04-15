import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { RecoverForm } from "./RecoverForm";

export const metadata: Metadata = {
  title: "DentaSync — Recuperar Acceso",
  description: "Restablece tu contraseña de DentaSync",
};

export default function RecoverPage() {
  return (
    <Card className="shadow-lg">
      <CardContent className="px-6 pb-6 pt-8">
        <RecoverForm />
      </CardContent>
    </Card>
  );
}
