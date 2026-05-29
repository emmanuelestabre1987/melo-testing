import { useNavigate } from "react-router-dom";
import { Truck, Package, Users, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const operations = [
  {
    id: "transportar",
    title: "Quiero transportar",
    description: "Tengo vehículo y ofrezco espacio de carga o butacas",
    icon: Truck,
    path: "/transportar",
    gradient: "gradient-primary",
  },
  {
    id: "dar-carga",
    title: "Quiero dar carga",
    description: "Necesito enviar una encomienda o carga",
    icon: Package,
    path: "/dar-carga",
    gradient: "gradient-warm",
  },
  {
    id: "viajar",
    title: "Quiero viajar",
    description: "Busco un viaje como pasajero",
    icon: Users,
    path: "/viajar",
    gradient: "gradient-cta",
  },
];

const SeleccionarOperacion = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold text-foreground">¿Qué querés hacer?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seleccioná una operación para comenzar
            </p>
          </div>

          <div className="space-y-3">
            {operations.map((op, i) => (
              <button
                key={op.id}
                onClick={() => navigate(op.path)}
                className="group flex w-full items-center gap-4 rounded-3xl bg-card border border-border p-5 text-left shadow-card transition-all animate-fade-in hover:shadow-card-hover hover:border-primary/30 active:scale-[0.98]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${op.gradient}`}>
                  <op.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{op.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{op.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SeleccionarOperacion;
