import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import OptionCard from "@/components/OptionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Box, Boxes } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FrecuenciaStep, { FrecuenciaData, isFrecuenciaValid } from "@/components/FrecuenciaStep";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import RouteMap from "@/components/RouteMap";

interface Coords { lat: number; lon: number; }

const DarCarga = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [tipoEnvio, setTipoEnvio] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [unidad, setUnidad] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [m3, setM3] = useState("");
  const [origen, setOrigen] = useState("");
  const [origenCoords, setOrigenCoords] = useState<Coords>();
  const [destino, setDestino] = useState("");
  const [destinoCoords, setDestinoCoords] = useState<Coords>();
  const [frecuencia, setFrecuencia] = useState<FrecuenciaData>({ tipo: "" });
  const [saving, setSaving] = useState(false);

  const totalSteps = tipoEnvio === "encomienda" ? 5 : 6;

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
      const { error } = await supabase.from("publications").insert([{
        user_id: user!.id,
        operation_type: "dar-carga",
        data: JSON.parse(JSON.stringify({
          tipoEnvio, tipoCarga, unidad, cantidad, m3,
          origen, origenCoords,
          destino, destinoCoords,
          frecuencia: frecuenciaData,
        })),
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
      case 1: return !tipoEnvio;
      case 2: return !tipoCarga;
      case 3: return tipoEnvio === "encomienda" ? !m3 : !unidad;
      case 4: return tipoEnvio === "encomienda" ? (!origen || !destino) : !cantidad;
      case 5: return tipoEnvio === "encomienda" ? !isFrecuenciaValid(frecuencia) : (!origen || !destino);
      case 6: return !isFrecuenciaValid(frecuencia);
      default: return false;
    }
  };

  const rutaStep = tipoEnvio === "encomienda" ? 4 : 5;

  return (
    <AppLayout>
    <WizardLayout
      title="Quiero dar carga"
      step={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={step === totalSteps ? (saving ? "Guardando..." : "Publicar") : "Siguiente"}
      nextDisabled={isNextDisabled()}
    >
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">¿Qué tipo de envío?</h3>
          <OptionCard label="Encomienda" description="Paquete pequeño/mediano" selected={tipoEnvio === "encomienda"} onClick={() => setTipoEnvio("encomienda")} icon={<Package className="h-5 w-5 text-primary-foreground" />} />
          <OptionCard label="Carga general" description="Materiales, muebles, maquinaria" selected={tipoEnvio === "carga-general"} onClick={() => setTipoEnvio("carga-general")} icon={<Boxes className="h-5 w-5 text-primary-foreground" />} />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Tipo de carga</h3>
          {["Electrodomésticos", "Materiales de construcción", "Maquinaria/Herramientas", "Alimentos", "Otros"].map((t) => (
            <OptionCard key={t} label={t} selected={tipoCarga === t} onClick={() => setTipoCarga(t)} />
          ))}
        </div>
      )}
      {step === 3 && tipoEnvio === "encomienda" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Volumen aproximado</h3>
          <div className="space-y-2"><Label>m³ aproximados</Label><Input type="number" placeholder="Ej: 0.5" value={m3} onChange={(e) => setM3(e.target.value)} /></div>
        </div>
      )}
      {step === 3 && tipoEnvio === "carga-general" && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">¿En qué unidad medís tu carga?</h3>
          <OptionCard label="Pallets" selected={unidad === "pallets"} onClick={() => setUnidad("pallets")} icon={<Box className="h-5 w-5 text-primary-foreground" />} />
          <OptionCard label="Bultos" selected={unidad === "bultos"} onClick={() => setUnidad("bultos")} icon={<Package className="h-5 w-5 text-primary-foreground" />} />
        </div>
      )}
      {step === 4 && tipoEnvio === "carga-general" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Cantidad de {unidad}</h3>
          <div className="space-y-2">
            <Label>{unidad === "pallets" ? "Cantidad de pallets" : "Cantidad"}</Label>
            <Input type="number" placeholder="Ej: 2" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            {unidad === "bultos" && (<><Label>m³ aproximados</Label><Input type="number" placeholder="Ej: 1.5" value={m3} onChange={(e) => setM3(e.target.value)} /></>)}
          </div>
        </div>
      )}
      {step === rutaStep && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Cargá tu ruta</h3>
          <LocationAutocomplete
            value={origen}
            onChange={(val, coords) => { setOrigen(val); if (coords) setOrigenCoords(coords); }}
            placeholder="Ej: San Marcos Sierras"
            label="Origen"
          />
          <LocationAutocomplete
            value={destino}
            onChange={(val, coords) => { setDestino(val); if (coords) setDestinoCoords(coords); }}
            placeholder="Ej: Córdoba Capital"
            label="Destino"
          />
          <RouteMap origin={origenCoords} destination={destinoCoords} />
        </div>
      )}
      {step === totalSteps && (
        <FrecuenciaStep value={frecuencia} onChange={setFrecuencia} />
      )}
    </WizardLayout>
    </AppLayout>
  );
};

export default DarCarga;
