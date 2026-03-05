import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import OptionCard from "@/components/OptionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FrecuenciaStep, { FrecuenciaData, isFrecuenciaValid } from "@/components/FrecuenciaStep";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import RouteMap from "@/components/RouteMap";

interface Coords { lat: number; lon: number; }

const Transportar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [tipoCarga, setTipoCarga] = useState("");
  const [rutaOrigen, setRutaOrigen] = useState("");
  const [rutaOrigenCoords, setRutaOrigenCoords] = useState<Coords>();
  const [rutaDestino, setRutaDestino] = useState("");
  const [rutaDestinoCoords, setRutaDestinoCoords] = useState<Coords>();
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaData>({ tipo: "" });
  const [espacio, setEspacio] = useState("");
  const [posicionPallet, setPosicionPallet] = useState("");
  const [saving, setSaving] = useState(false);

  const totalSteps = tipoCarga === "personas" ? 5 : 6;

  const handleBack = () => {
    if (step === 1) navigate("/seleccionar-operacion");
    else setStep(step - 1);
  };

  const handleNext = async () => {
    if (step === totalSteps) {
      setSaving(true);
      const frecuenciaData = {
        ...frecuencia,
        fecha: frecuencia.fecha ? frecuencia.fecha.toISOString() : undefined,
      };
      const ruta = {
        origen: rutaOrigen,
        origenCoords: rutaOrigenCoords,
        destino: rutaDestino,
        destinoCoords: rutaDestinoCoords,
      };
      const { error } = await supabase.from("publications").insert([{
        user_id: user!.id,
        operation_type: "transportar",
        data: JSON.parse(JSON.stringify({ tipoCarga, ruta, tipoVehiculo, frecuencia: frecuenciaData, espacio, posicionPallet })),
      }]);
      setSaving(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      navigate("/publicado");
    } else {
      setStep(step + 1);
    }
  };

  const isNextDisabled = () => {
    if (saving) return true;
    switch (step) {
      case 1: return !tipoCarga;
      case 2: return !rutaOrigen || !rutaDestino;
      case 3: return !tipoVehiculo;
      case 4: return !isFrecuenciaValid(frecuencia);
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
      nextLabel={step === totalSteps ? (saving ? "Guardando..." : "Publicar") : "Siguiente"}
      nextDisabled={isNextDisabled()}
    >
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">¿Qué querés transportar?</h3>
          <OptionCard label="Carga" description="Paquetes, materiales, electrodomésticos" selected={tipoCarga === "carga"} onClick={() => setTipoCarga("carga")} icon={<Package className="h-5 w-5 text-primary-foreground" />} />
          <OptionCard label="Personas" description="Pasajeros en tu vehículo" selected={tipoCarga === "personas"} onClick={() => setTipoCarga("personas")} icon={<Users className="h-5 w-5 text-primary-foreground" />} />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Cargá tu ruta</h3>
          <LocationAutocomplete
            value={rutaOrigen}
            onChange={(val, coords) => { setRutaOrigen(val); if (coords) setRutaOrigenCoords(coords); }}
            placeholder="Ej: San Marcos Sierras"
            label="Origen"
          />
          <LocationAutocomplete
            value={rutaDestino}
            onChange={(val, coords) => { setRutaDestino(val); if (coords) setRutaDestinoCoords(coords); }}
            placeholder="Ej: Córdoba Capital"
            label="Destino"
          />
          <RouteMap origin={rutaOrigenCoords} destination={rutaDestinoCoords} />
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Tipo de vehículo</h3>
          {(tipoCarga === "carga" ? ["Camioneta", "Chasis", "Otro"] : ["Camioneta/Auto", "Combi/Van", "Otro"]).map((v) => (
            <OptionCard key={v} label={v} selected={tipoVehiculo === v} onClick={() => setTipoVehiculo(v)} />
          ))}
        </div>
      )}
      {step === 4 && (
        <FrecuenciaStep value={frecuencia} onChange={setFrecuencia} />
      )}
      {step === 5 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{tipoCarga === "personas" ? "Butacas libres" : "Espacio disponible"}</h3>
          <div className="space-y-2">
            <Label>{tipoCarga === "personas" ? "¿Cuántas butacas ofrecés?" : "Metros cúbicos (m³) disponibles"}</Label>
            <Input type="number" placeholder="Ej: 3" value={espacio} onChange={(e) => setEspacio(e.target.value)} />
          </div>
        </div>
      )}
      {step === 6 && tipoCarga === "carga" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Posición de pallet</h3>
          <div className="space-y-2"><Label>Indicar posición (ej: 1x1.20)</Label><Input placeholder="1x1.20" value={posicionPallet} onChange={(e) => setPosicionPallet(e.target.value)} /></div>
        </div>
      )}
    </WizardLayout>
  );
};

export default Transportar;
