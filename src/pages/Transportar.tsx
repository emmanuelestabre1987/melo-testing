import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import OptionCard from "@/components/OptionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Users } from "lucide-react";

const Transportar = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tipoCarga, setTipoCarga] = useState<string>("");
  const [ruta, setRuta] = useState({ origen: "", destino: "" });
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [espacio, setEspacio] = useState("");

  const totalSteps = tipoCarga === "personas" ? 5 : 6;

  const handleBack = () => {
    if (step === 1) navigate("/seleccionar-operacion");
    else setStep(step - 1);
  };

  const handleNext = () => {
    if (step === totalSteps) {
      navigate("/publicado");
    } else {
      setStep(step + 1);
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1: return !tipoCarga;
      case 2: return !ruta.origen || !ruta.destino;
      case 3: return !tipoVehiculo;
      case 4: return !frecuencia;
      case 5: return tipoCarga === "carga" && !espacio;
      default: return false;
    }
  };

  return (
    <WizardLayout
      title="Quiero transportar"
      step={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={step === totalSteps ? "Publicar" : "Siguiente"}
      nextDisabled={isNextDisabled()}
    >
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">¿Qué querés transportar?</h3>
          <OptionCard
            label="Carga"
            description="Paquetes, materiales, electrodomésticos"
            selected={tipoCarga === "carga"}
            onClick={() => setTipoCarga("carga")}
            icon={<Package className="h-5 w-5 text-primary-foreground" />}
          />
          <OptionCard
            label="Personas"
            description="Pasajeros en tu vehículo"
            selected={tipoCarga === "personas"}
            onClick={() => setTipoCarga("personas")}
            icon={<Users className="h-5 w-5 text-primary-foreground" />}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Cargá tu ruta</h3>
          <div className="space-y-2">
            <Label>Origen</Label>
            <Input placeholder="Ej: San Marcos Sierras" value={ruta.origen} onChange={(e) => setRuta({ ...ruta, origen: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Destino</Label>
            <Input placeholder="Ej: Córdoba Capital" value={ruta.destino} onChange={(e) => setRuta({ ...ruta, destino: e.target.value })} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Tipo de vehículo</h3>
          {(tipoCarga === "carga"
            ? ["Camioneta", "Chasis", "Otro"]
            : ["Camioneta/Auto", "Combi/Van", "Otro"]
          ).map((v) => (
            <OptionCard key={v} label={v} selected={tipoVehiculo === v} onClick={() => setTipoVehiculo(v)} />
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Frecuencia de operación</h3>
          {["Fecha específica", "Todos los lunes", "Lunes a viernes", "Semanal", "Quincenal"].map((f) => (
            <OptionCard key={f} label={f} selected={frecuencia === f} onClick={() => setFrecuencia(f)} />
          ))}
        </div>
      )}

      {step === 5 && tipoCarga === "carga" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Espacio disponible</h3>
          <div className="space-y-2">
            <Label>Metros cúbicos (m³) disponibles</Label>
            <Input type="number" placeholder="Ej: 3" value={espacio} onChange={(e) => setEspacio(e.target.value)} />
          </div>
        </div>
      )}

      {step === 5 && tipoCarga === "personas" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Butacas libres</h3>
          <div className="space-y-2">
            <Label>¿Cuántas butacas ofrecés?</Label>
            <Input type="number" placeholder="Ej: 3" value={espacio} onChange={(e) => setEspacio(e.target.value)} />
          </div>
        </div>
      )}

      {step === 6 && tipoCarga === "carga" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Posición de pallet</h3>
          <div className="space-y-2">
            <Label>Indicar posición (ej: 1x1.20)</Label>
            <Input placeholder="1x1.20" />
          </div>
        </div>
      )}
    </WizardLayout>
  );
};

export default Transportar;
