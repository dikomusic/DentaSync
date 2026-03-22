import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, Zap, Smartphone, Shield } from 'lucide-react';

export default function Inicio() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 h-20 flex items-center border-b justify-between bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Stethoscope size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-primary">DentaSync</span>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/panel-de-control">Acceder al Sistema</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 bg-gradient-to-b from-primary/5 to-transparent">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tight max-w-4xl">
          Gestión Dental <span className="text-primary">Inteligente</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          La plataforma definitiva para odontólogos modernos. Automatiza tu agenda con IA y mejora la experiencia de tus pacientes.
        </p>
        <Button size="lg" className="h-14 px-10 text-lg rounded-2xl group" asChild>
          <Link href="/panel-de-control">
            Comenzar Ahora <Zap className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
