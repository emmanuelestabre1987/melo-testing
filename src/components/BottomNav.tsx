import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Tablero", icon: LayoutDashboard, path: "/tablero" },
  { label: "Publicar", icon: Plus, path: "/seleccionar-operacion" },
  { label: "Matches", icon: Bell, path: "/mis-matches" },
];

interface BottomNavProps {
  pendingCount?: number;
}

const BottomNav = ({ pendingCount = 0 }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-bottom sm:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative min-w-[60px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {item.path === "/mis-matches" && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {item.label}
              </span>
              {active && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
        <button
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground min-w-[60px]"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
