import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const Publicado = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
          <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">¡Publicado!</h1>
        <p className="mb-8 text-muted-foreground">
          Tu solicitud fue publicada con éxito.<br />
          Te avisaremos cuando haya coincidencias.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate("/tablero")} className="w-full" size="lg">
            Ir al tablero
          </Button>
          <Button onClick={() => navigate("/seleccionar-operacion")} variant="outline" className="w-full" size="lg">
            Nueva operación
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Publicado;
