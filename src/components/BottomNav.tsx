import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tablero", icon: LayoutDashboard, path: "/tablero" },
  { label: "Publicar", icon: Plus, path: "/seleccionar-operacion" },
  { label: "Matches", icon: Bell, path: "/mis-matches" },
  { label: "Perfil", icon: User, path: "/perfil" },
];

interface BottomNavProps {
  pendingCount?: number;
}

const BottomNav = ({ pendingCount = 0 }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass safe-bottom sm:hidden"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const showBadge = item.path === "/mis-matches" && pendingCount > 0;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={
                showBadge ? `${item.label}, ${pendingCount} pendientes` : item.label
              }
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-colors tap-scale",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <div className="relative">
                <item.icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.5]")} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
