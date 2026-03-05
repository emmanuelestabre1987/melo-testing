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
import logoMelo from "@/assets/logo-melo.png";

interface AppHeaderProps {
  pendingCount?: number;
  onRefresh?: () => void;
  filterSlot?: React.ReactNode;
}

/** Decorative SVG: sierras silhouette + circuit-node dots blending community & digital */
const HeaderDecoration = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Mountain silhouette — back layer */}
    <svg
      viewBox="0 0 800 80"
      className="absolute bottom-0 left-0 w-full h-[50px]"
      preserveAspectRatio="none"
    >
      <path
        d="M0 80 L0 52 Q40 38 80 46 Q120 22 160 34 Q200 14 240 28 Q280 8 320 22 Q360 12 400 26 Q440 6 480 20 Q520 14 560 28 Q600 8 640 22 Q680 16 720 30 Q760 20 800 32 L800 80 Z"
        fill="hsl(var(--accent))"
        opacity="0.06"
      />
      <path
        d="M0 80 L0 60 Q50 48 90 54 Q130 36 170 44 Q210 28 250 38 Q290 20 330 32 Q370 24 410 36 Q450 18 490 30 Q530 26 570 36 Q610 22 650 34 Q690 28 730 38 Q770 30 800 40 L800 80 Z"
        fill="hsl(var(--accent))"
        opacity="0.04"
      />
    </svg>

    {/* Circuit/connectivity dots — digital layer */}
    <svg
      viewBox="0 0 800 80"
      className="absolute inset-0 w-full h-full"
    >
      {/* Horizontal trace line */}
      <line x1="60" y1="65" x2="740" y2="65" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.06" />
      
      {/* Node dots along the trace */}
      {[100, 200, 340, 460, 580, 700].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={65} r="1.5" fill="hsl(var(--primary))" opacity="0.1" />
          <line
            x1={x} y1={65} x2={x} y2={65 - (8 + (i % 3) * 4)}
            stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.06"
          />
          <circle cx={x} cy={65 - (8 + (i % 3) * 4)} r="1" fill="hsl(var(--primary))" opacity="0.08" />
        </g>
      ))}

      {/* WiFi arcs — top right corner, very subtle */}
      <g transform="translate(760, 14)" opacity="0.06">
        <path d="M-6 0 A6 6 0 0 1 6 0" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
        <path d="M-10 -2 A10 10 0 0 1 10 -2" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.8" />
        <circle cx="0" cy="3" r="1.2" fill="hsl(var(--primary))" />
      </g>
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
    <header
      className="relative overflow-hidden border-b border-border/40 h-16"
      style={{ backgroundColor: "hsl(var(--header-background))" }}
    >
      <HeaderDecoration />

      <div className="relative z-10 flex items-center justify-between px-3 h-full">
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
