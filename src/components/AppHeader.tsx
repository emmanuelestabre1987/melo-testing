import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoMelo from "@/assets/logo-melo.png";

interface AppHeaderProps {
  pendingCount?: number;
  onRefresh?: () => void;
  filterSlot?: React.ReactNode;
}

const SierrasSVG = () => (
  <svg
    viewBox="0 0 400 60"
    className="absolute bottom-0 left-0 w-full h-[30px] opacity-[0.08]"
    preserveAspectRatio="none"
  >
    <path
      d="M0 60 L0 38 Q20 32 35 36 Q55 18 75 28 Q95 14 110 22 Q130 8 150 18 Q170 6 190 16 Q210 4 230 14 Q250 8 270 20 Q290 10 310 22 Q330 6 350 18 Q370 12 390 24 L400 20 L400 60 Z"
      fill="hsl(var(--accent))"
      className="animate-[sierras-sway_8s_ease-in-out_infinite]"
    />
    <path
      d="M0 60 L0 44 Q30 36 50 40 Q70 28 90 34 Q120 22 140 30 Q160 20 180 28 Q200 16 220 26 Q240 22 260 30 Q280 18 300 28 Q320 24 340 32 Q360 22 380 30 L400 28 L400 60 Z"
      fill="hsl(var(--accent))"
      className="animate-[sierras-sway_6s_ease-in-out_infinite_reverse]"
    />
  </svg>
);

const AppHeader = ({ pendingCount = 0, onRefresh, filterSlot }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isTablero = location.pathname === "/tablero";

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const userEmail = user?.email || "";
  const userInitial = (userName[0] || "U").toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="relative overflow-hidden border-b border-border bg-card">
      <SierrasSVG />

      <div className="relative z-10 flex items-center justify-between px-3 h-16">
        {/* Left: sidebar trigger + brand */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <button onClick={() => navigate("/tablero")} className="flex items-center gap-2">
            <img src={logoMelo} alt="MELO Logo" className="h-12 object-contain" />
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          {isTablero && (
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => navigate("/seleccionar-operacion")}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Crear Publicación</span>
              <span className="sm:hidden">Crear</span>
            </Button>
          )}
          {filterSlot}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8"
            onClick={() => navigate("/mis-matches")}
          >
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {pendingCount}
              </span>
            )}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold shadow-sm transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring">
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
