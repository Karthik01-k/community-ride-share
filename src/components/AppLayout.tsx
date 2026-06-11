import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LogOut, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground" />
              <span className="font-display text-xs text-muted-foreground hidden sm:inline">
                MENU
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="h-9 w-9 flex items-center justify-center text-foreground/70 hover:text-giallo transition-colors">
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="h-9 w-9 flex items-center justify-center text-foreground/70 hover:text-giallo transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
