import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col md:flex-row w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b px-4 md:px-6 bg-background/70 glass shadow-lg animate-fade-in sticky top-0 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger />
              <h1 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-violet-500 to-green-500 bg-clip-text text-transparent font-playfair tracking-wide drop-shadow truncate">Growth Hub Manager</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:inline text-xs md:text-sm text-foreground font-mono font-bold bg-gradient-primary bg-clip-text text-transparent truncate max-w-[120px] md:max-w-xs">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut} className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm">Sign Out</Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background/60 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}