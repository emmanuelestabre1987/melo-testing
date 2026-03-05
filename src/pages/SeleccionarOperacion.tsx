import { useNavigate } from "react-router-dom";
import { Truck, Package, Users } from "lucide-react";
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
      <div className="px-3 sm:px-4 py-5 sm:py-8">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">¿Qué querés hacer?</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Seleccioná una operación para comenzar
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {operations.map((op, i) => (
              <button
                key={op.id}
                onClick={() => navigate(op.path)}
                className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 text-left shadow-card transition-all hover:shadow-card-hover hover:border-primary/30 active:scale-[0.98]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${op.gradient}`}>
                  <op.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{op.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{op.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SeleccionarOperacion;
