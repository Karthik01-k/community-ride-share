import { Home, Search, Plus, User, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Find Rides", url: "/find-rides", icon: Search },
  { title: "Post Ride", url: "/post-ride", icon: Plus },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="px-4 py-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center bg-giallo text-black">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          {open && (
            <div className="leading-none">
              <div className="font-display text-lg text-white">CRSP</div>
              <div className="font-display text-[10px] text-[hsl(var(--steel-mid))]">RIDESHARE / IN</div>
            </div>
          )}
        </div>

        <SidebarGroup>
          {open && <SidebarGroupLabel className="font-display text-[10px] tracking-[0.2em] text-[hsl(var(--steel-mid))] px-4 pt-6">NAVIGATE</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-none h-12">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 font-display text-sm transition-colors ${
                          isActive
                            ? "bg-[hsl(0_0%_15%)] text-giallo border-l-2 border-giallo"
                            : "text-white/80 hover:text-giallo hover:bg-[hsl(0_0%_13%)]"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {open && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="font-display text-[10px] text-[hsl(var(--steel-mid))] leading-relaxed">
              COMMUNITY-FIRST<br/>RIDE SHARING<br/>—<br/>EST. 2024
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
