import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, Shield, Smartphone, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 lg:px-12 h-20 flex items-center border-b justify-between bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Stethoscope size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-primary">DentaSync</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">Características</Link>
          <Link href="#" className="hover:text-primary transition-colors">Planes</Link>
          <Link href="#" className="hover:text-primary transition-colors">Soporte</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Prueba Gratis</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl pointer-events-none opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-6xl mx-auto text-center space-y-8 relative">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1">
              Nuevo: Optimización de Agenda con IA
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Gestión Dental <span className="text-primary">Inteligente</span> y Conectada
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              DentaSync es el ecosistema SaaS diseñado para automatizar tu clínica. Agenda inteligente, expedientes digitales y comunicación nativa con tus pacientes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-primary/20 group" asChild>
                <Link href="/dashboard">
                  Empezar Ahora 
                  <Zap className="ml-2 h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-2xl bg-white/50 backdrop-blur-sm">
                Ver Demo
              </Button>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-12 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4 group">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold">Agenda con IA</h3>
            <p className="text-muted-foreground">Optimiza automáticamente tus tiempos muertos y asigna citas basadas en el historial del paciente.</p>
          </div>
          <div className="space-y-4 group">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <Smartphone size={28} />
            </div>
            <h3 className="text-xl font-bold">App Multiperfil</h3>
            <p className="text-muted-foreground">Una experiencia híbrida para pacientes y odontólogos, facilitando la movilidad y el autoservicio.</p>
          </div>
          <div className="space-y-4 group">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-bold">Seguridad Total</h3>
            <p className="text-muted-foreground">Datos cifrados en la nube bajo estándares médicos para garantizar la confidencialidad de tus expedientes.</p>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Stethoscope className="text-primary" />
            <span className="font-bold text-lg">DentaSync</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DentaSync Dental Solutions. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
