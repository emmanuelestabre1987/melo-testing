import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Bell, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  pendingCount?: number;
  onRefresh?: () => void;
  showActions?: boolean;
}

const SierrasSVG = () => (
  <svg
    viewBox="0 0 400 60"
    className="absolute bottom-0 left-0 w-full h-[40px] opacity-[0.12]"
    preserveAspectRatio="none"
  >
    {/* Back range - lighter */}
    <path
      d="M0 60 L0 38 Q20 32 35 36 Q55 18 75 28 Q95 14 110 22 Q130 8 150 18 Q170 6 190 16 Q210 4 230 14 Q250 8 270 20 Q290 10 310 22 Q330 6 350 18 Q370 12 390 24 L400 20 L400 60 Z"
      fill="hsl(var(--primary))"
      className="animate-[sierras-sway_8s_ease-in-out_infinite]"
    />
    {/* Front range - darker */}
    <path
      d="M0 60 L0 44 Q30 36 50 40 Q70 28 90 34 Q120 22 140 30 Q160 20 180 28 Q200 16 220 26 Q240 22 260 30 Q280 18 300 28 Q320 24 340 32 Q360 22 380 30 L400 28 L400 60 Z"
      fill="hsl(var(--primary))"
      className="animate-[sierras-sway_6s_ease-in-out_infinite_reverse]"
    />
  </svg>
);

const AppHeader = ({ pendingCount = 0, onRefresh, showActions = true }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isTablero = location.pathname === "/tablero";

  return (
    <header className="relative overflow-hidden border-b border-border bg-card">
      {/* Sierras background */}
      <SierrasSVG />

      <div className="relative z-10 mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <button onClick={() => navigate("/tablero")} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm">
            <span className="text-sm font-extrabold text-primary-foreground tracking-tight">M</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-foreground leading-none">
              MELO
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight">
              Sierras de Córdoba
            </p>
          </div>
        </button>

        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
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
            {onRefresh && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {isTablero && (
              <Button size="sm" className="h-8 ml-1" onClick={() => navigate("/seleccionar-operacion")}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Publicar
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
