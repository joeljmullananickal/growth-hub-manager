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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-background/70 glass shadow-lg animate-fade-in sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="font-bold text-2xl bg-gradient-to-r from-violet-500 to-green-500 bg-clip-text text-transparent font-playfair tracking-wide drop-shadow">Growth Hub Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground font-mono font-bold bg-gradient-primary bg-clip-text text-transparent">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background/60">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}