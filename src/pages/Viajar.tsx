import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight, Users, Calendar } from "lucide-react";
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

  const [origen, setOrigen] = useState("");
  const [origenCoords, setOrigenCoords] = useState<Coords>();
  const [destino, setDestino] = useState("");
  const [destinoCoords, setDestinoCoords] = useState<Coords>();
  const [cantidadPersonas, setCantidadPersonas] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaData>({ tipo: "" });
  const [saving, setSaving] = useState(false);

  const totalSteps = 1;

  const handleBack = () => navigate("/seleccionar-operacion");

  const handleNext = async () => {
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
  };

  const isNextDisabled = () => {
    if (saving) return true;
    return !origen || !destino || !cantidadPersonas || !isFrecuenciaValid(frecuencia);
  };

  return (
    <AppLayout>
      <WizardLayout
        title="Quiero viajar"
        step={1}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={saving ? "Guardando..." : "Publicar"}
        nextDisabled={isNextDisabled()}
      >
        <div className="space-y-5">
          {/* Ruta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">¿A dónde y cuántos viajan?</h3>
            <LocationAutocomplete
              value={origen}
              onChange={(val, coords) => { setOrigen(val); if (coords) setOrigenCoords(coords); }}
              placeholder="Ej: San Marcos Sierras"
              label="Origen"
              enableCurrentLocation
            />
            <LocationAutocomplete
              value={destino}
              onChange={(val, coords) => { setDestino(val); if (coords) setDestinoCoords(coords); }}
              placeholder="Ej: Córdoba Capital"
              label="Destino"
            />
            <RouteMap origin={origenCoords} destination={destinoCoords} />
            <div className="space-y-2">
              <Label>Cantidad de personas</Label>
              <Input
                type="number"
                min="1"
                placeholder="Ej: 2"
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(e.target.value)}
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-border" />

          {/* Cuándo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">¿Cuándo?</h3>
            <FrecuenciaStep value={frecuencia} onChange={setFrecuencia} />
          </div>

          {/* Resumen previo a publicar */}
          <Card className="rounded-2xl border-border bg-muted/40">
            <CardContent className="p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Resumen de tu publicación
              </p>

              {/* Ruta */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="font-medium text-foreground truncate">{origen || "—"}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="font-medium text-foreground truncate">{destino || "—"}</span>
              </div>

              {/* Personas */}
              {cantidadPersonas && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-foreground">
                    {cantidadPersonas} persona{Number(cantidadPersonas) !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Frecuencia */}
              {isFrecuenciaValid(frecuencia) && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-foreground">
                    {frecuencia.tipo === "fecha-especifica" && frecuencia.fecha
                      ? frecuencia.fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long" })
                      : frecuencia.tipo === "dias-semana"
                      ? (frecuencia.diasSemana || []).join(", ")
                      : frecuencia.tipo === "rango-dias"
                      ? `${frecuencia.rangoDesde} a ${frecuencia.rangoHasta}`
                      : "—"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </WizardLayout>
    </AppLayout>
  );
};

export default Viajar;
