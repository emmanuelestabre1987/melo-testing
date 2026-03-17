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
    <header className="border-b border-border bg-background h-14 sm:h-16 z-50">
      <div className="flex items-center justify-between px-3 sm:px-4 h-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8 hidden sm:flex" />
          <button onClick={() => navigate("/tablero")} className="flex items-center">
            <MeloLogo className="h-8 sm:h-10 w-auto" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {isTablero && (
            <Button
              size="sm"
              className="h-8 text-xs px-3 rounded-full font-semibold"
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
            className="relative h-8 w-8 hidden sm:flex"
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
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring">
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
