import {
  LayoutDashboard, Search, Plus, MapPin, Wallet, Gift,
  Zap, Settings, LifeBuoy, User, LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Book a Ride", url: "/find-rides", icon: Search },
  { title: "Post a Ride", url: "/post-ride", icon: Plus },
  { title: "My Rides", url: "/my-rides", icon: MapPin },
  { title: "Track Ride", url: "/track", icon: MapPin },
];

const secondaryItems = [
  { title: "Payments", url: "/payment", icon: Wallet },
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Become Captain", url: "/become-captain", icon: Zap },
  { title: "Profile", url: "/profile", icon: User },
];

const supportItems = [
  { title: "Settings", url: "/profile", icon: Settings },
  { title: "Support", url: "/profile", icon: LifeBuoy },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-[hsl(var(--indigo-soft))] text-[hsl(var(--primary))]"
        : "text-sidebar-foreground hover:bg-muted"
    }`;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {/* Brand */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[hsl(var(--primary))] text-white shrink-0">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          {open && (
            <div className="leading-tight">
              <div className="font-display text-base text-foreground">Let's Raid</div>
              <div className="text-[10px] text-muted-foreground font-medium">Convenient Rides</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          {open && <SidebarGroupLabel className="px-4 pt-4 text-[10px] tracking-widest text-muted-foreground">MAIN</SidebarGroupLabel>}
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-xl h-auto p-0 hover:bg-transparent">
                    <NavLink to={item.url} className={linkCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {open && <SidebarGroupLabel className="px-4 pt-2 text-[10px] tracking-widest text-muted-foreground">ACCOUNT</SidebarGroupLabel>}
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-xl h-auto p-0 hover:bg-transparent">
                    <NavLink to={item.url} className={linkCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {open && <SidebarGroupLabel className="px-4 pt-2 text-[10px] tracking-widest text-muted-foreground">HELP</SidebarGroupLabel>}
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-xl h-auto p-0 hover:bg-transparent">
                    <NavLink to={item.url} className={linkCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-3 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(0_84%_97%)] transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
