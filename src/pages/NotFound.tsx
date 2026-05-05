import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 safe-bottom">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs font-semibold text-muted-foreground">Error 404</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Esta página no existe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La ruta <span className="font-medium text-foreground">{location.pathname}</span> no está disponible.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="w-full">
            <a href="/">Volver al inicio</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/tablero">Ir al tablero</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
