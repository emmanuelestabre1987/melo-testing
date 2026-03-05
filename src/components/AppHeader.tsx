import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Plus, LogOut } from "lucide-react";
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
import MeloLogo from "@/components/MeloLogo";

interface AppHeaderProps {
  pendingCount?: number;
  onRefresh?: () => void;
  filterSlot?: React.ReactNode;
}

/** Sharp pointed sierras + circuit traces — community meets digital */
const HeaderDecoration = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg
      viewBox="0 0 1200 80"
      className="absolute bottom-0 left-0 w-full h-[40px] sm:h-[50px]"
      preserveAspectRatio="none"
    >
      <path
        d="M0 80 L0 52 L40 30 L70 50 L100 18 L130 42 L170 8 L210 38 L240 15 L275 45 L310 12 L350 40 L380 20 L420 48 L460 10 L500 35 L540 22 L580 50 L610 14 L650 42 L690 6 L730 38 L770 18 L810 45 L850 10 L890 36 L930 20 L970 48 L1010 8 L1050 40 L1090 22 L1130 46 L1170 16 L1200 35 L1200 80 Z"
        fill="hsl(var(--accent))"
        opacity="0.08"
      />
      <path
        d="M0 80 L0 62 L50 42 L80 58 L120 32 L155 52 L190 28 L230 50 L265 35 L300 55 L340 26 L380 48 L420 30 L460 54 L500 22 L540 46 L580 32 L620 56 L660 28 L700 50 L740 34 L780 55 L820 25 L860 48 L900 36 L940 56 L980 30 L1020 52 L1060 38 L1100 55 L1140 32 L1180 50 L1200 42 L1200 80 Z"
        fill="hsl(var(--accent))"
        opacity="0.05"
      />
    </svg>
    <svg viewBox="0 0 1200 80" className="absolute inset-0 w-full h-full hidden sm:block">
      <line x1="80" y1="68" x2="1120" y2="68" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.05" />
      {[150, 300, 480, 650, 820, 1000].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={68} r="1.5" fill="hsl(var(--primary))" opacity="0.08" />
          <line x1={x} y1={68} x2={x} y2={68 - (6 + (i % 3) * 3)} stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.05" />
          <circle cx={x} cy={68 - (6 + (i % 3) * 3)} r="1" fill="hsl(var(--primary))" opacity="0.06" />
        </g>
      ))}
    </svg>
  </div>
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
    <header className="relative overflow-hidden border-b border-border/40 h-14 sm:h-16 bg-background z-50">
      <HeaderDecoration />

      <div className="relative z-10 flex items-center justify-between px-2 sm:px-3 h-full">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <button onClick={() => navigate("/tablero")} className="flex items-center">
            <MeloLogo className="h-10 sm:h-12 w-auto" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {isTablero && (
            <Button
              size="sm"
              className="h-7 sm:h-8 text-[11px] sm:text-xs px-2 sm:px-3"
              onClick={() => navigate("/seleccionar-operacion")}
            >
              <Plus className="h-3.5 w-3.5 mr-0.5 sm:mr-1" />
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
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-sm transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring">
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
