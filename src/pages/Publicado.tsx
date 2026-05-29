import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const Publicado = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-5 safe-bottom">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">¡Publicado!</h1>
          <p className="mb-8 text-sm text-muted-foreground max-w-xs mx-auto">
            Tu solicitud fue publicada con éxito.<br />
            Te avisaremos cuando haya coincidencias.
          </p>
          <div className="space-y-3 w-full max-w-xs mx-auto">
            <Button onClick={() => navigate("/tablero")} className="w-full h-11 font-semibold">
              Ir al tablero
            </Button>
            <Button onClick={() => navigate("/seleccionar-operacion")} variant="outline" className="w-full h-11">
              Nueva operación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publicado;
