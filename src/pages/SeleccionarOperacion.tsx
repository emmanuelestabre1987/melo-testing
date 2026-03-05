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
    gradient: "gradient-primary",
  },
];

const SeleccionarOperacion = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="px-4 py-8">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">¿Qué querés hacer?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seleccioná una operación para comenzar
            </p>
          </div>

          <div className="space-y-4">
            {operations.map((op, i) => (
              <button
                key={op.id}
                onClick={() => navigate(op.path)}
                className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-card transition-all hover:shadow-card-hover hover:border-primary/30 active:scale-[0.98]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${op.gradient}`}>
                  <op.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{op.title}</h3>
                  <p className="text-sm text-muted-foreground">{op.description}</p>
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
