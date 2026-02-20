import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Viajar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [cantidadPersonas, setCantidadPersonas] = useState("");
  const [fecha, setFecha] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;

  const handleBack = () => {
    if (step === 1) navigate("/seleccionar-operacion");
    else setStep(step - 1);
  };

  const handleNext = async () => {
    if (step === totalSteps) {
      setSaving(true);
      const { error } = await supabase.from("publications").insert({
        user_id: user!.id,
        operation_type: "viajar",
        data: { cantidadPersonas, fecha, origen, destino },
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
      case 2: return !fecha;
      case 3: return !origen;
      case 4: return !destino;
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Fecha de viaje</h3>
          <div className="space-y-2"><Label>¿Cuándo querés viajar?</Label><Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Origen</h3>
          <div className="space-y-2"><Label>¿Desde dónde salís?</Label><Input placeholder="Ej: San Marcos Sierras" value={origen} onChange={(e) => setOrigen(e.target.value)} /></div>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Destino</h3>
          <div className="space-y-2"><Label>¿A dónde vas?</Label><Input placeholder="Ej: Córdoba Capital" value={destino} onChange={(e) => setDestino(e.target.value)} /></div>
        </div>
      )}
    </WizardLayout>
  );
};

export default Viajar;
