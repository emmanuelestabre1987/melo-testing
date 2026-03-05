import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FrecuenciaStep, { FrecuenciaData, isFrecuenciaValid } from "@/components/FrecuenciaStep";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import RouteMap from "@/components/RouteMap";

interface Coords { lat: number; lon: number; }

const Viajar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [cantidadPersonas, setCantidadPersonas] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaData>({ tipo: "" });
  const [origen, setOrigen] = useState("");
  const [origenCoords, setOrigenCoords] = useState<Coords>();
  const [destino, setDestino] = useState("");
  const [destinoCoords, setDestinoCoords] = useState<Coords>();
  const [saving, setSaving] = useState(false);

  const totalSteps = 3;

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
      const { error } = await supabase.from("publications").insert({
        user_id: user!.id,
        operation_type: "viajar",
        data: JSON.parse(JSON.stringify({
          cantidadPersonas,
          frecuencia: frecuenciaData,
          origen, origenCoords,
          destino, destinoCoords,
        })),
      });
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
      case 1: return !cantidadPersonas;
      case 2: return !origen || !destino;
      case 3: return !isFrecuenciaValid(frecuencia);
      default: return false;
    }
  };

  return (
    <WizardLayout
      title="Quiero viajar"
      step={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={step === totalSteps ? (saving ? "Guardando..." : "Publicar") : "Siguiente"}
      nextDisabled={isNextDisabled()}
    >
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">¿Cuántas personas viajan?</h3>
          <div className="space-y-2"><Label>Cantidad de personas</Label><Input type="number" min="1" placeholder="Ej: 2" value={cantidadPersonas} onChange={(e) => setCantidadPersonas(e.target.value)} /></div>
        </div>
      )}
      {step === 2 && (
        <FrecuenciaStep value={frecuencia} onChange={setFrecuencia} />
      )}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Origen</h3>
          <LocationAutocomplete
            value={origen}
            onChange={(val, coords) => { setOrigen(val); if (coords) setOrigenCoords(coords); }}
            placeholder="Ej: San Marcos Sierras"
            label="¿Desde dónde salís?"
          />
          {origenCoords && <RouteMap origin={origenCoords} destination={destinoCoords} />}
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Destino</h3>
          <LocationAutocomplete
            value={destino}
            onChange={(val, coords) => { setDestino(val); if (coords) setDestinoCoords(coords); }}
            placeholder="Ej: Córdoba Capital"
            label="¿A dónde vas?"
          />
          <RouteMap origin={origenCoords} destination={destinoCoords} />
        </div>
      )}
    </WizardLayout>
  );
};

export default Viajar;
