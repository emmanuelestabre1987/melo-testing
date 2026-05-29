import { LayoutDashboard, Plus, Bell, Package, Truck, Users, User, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import MeloLogo from "@/components/MeloLogo";

const mainItems = [
  { title: "Tablero", url: "/tablero", icon: LayoutDashboard },
  { title: "Nueva publicación", url: "/seleccionar-operacion", icon: Plus },
  { title: "Mis matches", url: "/mis-matches", icon: Bell },
  { title: "Perfil", url: "/perfil", icon: User },
];

const operationItems = [
  { title: "Transportar", url: "/transportar", icon: Truck },
  { title: "Dar carga", url: "/dar-carga", icon: Package },
  { title: "Viajar", url: "/viajar", icon: Users },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Hide sidebar on mobile — we use bottom nav instead
  if (isMobile) return null;

  return (
    <Sidebar collapsible="icon" className="border-r border-border !bg-background !top-14 sm:!top-16 !h-[calc(100dvh-3.5rem)] sm:!h-[calc(100dvh-4rem)]">
      <SidebarContent className="pt-2">
        {!collapsed && (
          <div className="flex items-center justify-center py-3 px-3">
            <MeloLogo className="h-14 w-auto" />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg"
                      activeClassName="bg-accent text-accent-foreground font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
            Operaciones
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg"
                      activeClassName="bg-accent text-accent-foreground font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => {
                signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Cerrar sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
