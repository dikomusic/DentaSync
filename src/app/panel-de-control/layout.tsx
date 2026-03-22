"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function DisenoPanelControl({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-sm">
          <header className="flex h-16 items-center border-b px-6 bg-white/80 sticky top-0 z-30 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-6 w-px bg-border hidden md:block" />
              <h1 className="text-sm font-semibold text-muted-foreground hidden md:block">
                Centro de Control Odontológico
              </h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                DR
               </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
