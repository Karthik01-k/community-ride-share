import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BrandLogo } from "@/components/BrandLogo";
import { Bell, Search } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 bg-background/90 backdrop-blur z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground" />
              <BrandLogo size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <button className="h-10 w-10 flex items-center justify-center rounded-xl text-foreground hover:bg-muted transition-colors">
                <Search className="h-4 w-4" />
              </button>
              <button className="h-10 w-10 flex items-center justify-center rounded-xl text-foreground hover:bg-muted transition-colors relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[hsl(var(--coral))]" />
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
