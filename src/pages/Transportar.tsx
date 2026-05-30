import { useState, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import OptionCard from "@/components/OptionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Users, MapPin, ArrowRight, Truck, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FrecuenciaStep, { FrecuenciaData, isFrecuenciaValid } from "@/components/FrecuenciaStep";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import RouteMap from "@/components/RouteMap";

interface Coords { lat: number; lon: number; }

interface LocationState {
  matchWith?: string;
  tipoCarga?: string;
}

const Transportar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LocationState | null) ?? {};
  const matchWith = locationState.matchWith;
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Paso 1 — Ruta
  const [rutaOrigen, setRutaOrigen] = useState("");
  const [rutaOrigenCoords, setRutaOrigenCoords] = useState<Coords>();
  const [rutaDestino, setRutaDestino] = useState("");
  const [rutaDestinoCoords, setRutaDestinoCoords] = useState<Coords>();

  // Paso 1 — Qué (pre-seed tipoCarga from match context if provided)
  const [tipoCarga, setTipoCarga] = useState(locationState.tipoCarga ?? "");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [espacio, setEspacio] = useState("");
  const [posicionPallet, setPosicionPallet] = useState("");

  // Paso 2 — Cuándo
  const [frecuencia, setFrecuencia] = useState<FrecuenciaData>({ tipo: "" });

  const [saving, setSaving] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  const totalSteps = 2;

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
      const { data: insertData, error } = await supabase
        .from("publications")
        .insert([{
          user_id: user!.id,
          operation_type: "transportar",
          data: JSON.parse(JSON.stringify({ tipoCarga, ruta, tipoVehiculo, frecuencia: frecuenciaData, espacio, posicionPallet })),
        }])
        .select("id")
        .single();
      setSaving(false);
      if (error || !insertData) {
        toast({ title: "Error", description: error?.message, variant: "destructive" });
        return;
      }
      if (matchWith) {
        await supabase.from("matches").insert({
          publication_id: matchWith,
          matched_publication_id: insertData.id,
          user_id: user!.id,
        });
        toast({ title: "¡Publicación creada y match enviado!" });
        navigate("/mis-matches");
      } else {
        navigate("/publicado");
      }
    } else {
      setStep(step + 1);
    }
  };

  const isNextDisabled = () => {
    if (saving) return true;
    switch (step) {
      case 1:
        return (
          !rutaOrigen || !rutaDestino ||
          !tipoCarga || !tipoVehiculo ||
          (tipoCarga === "carga" && !espacio)
        );
      case 2: return !isFrecuenciaValid(frecuencia);
      default: return false;
    }
  };

  return (
    <AppLayout>
      <WizardLayout
        title="Quiero transportar"
        step={step}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={step === totalSteps ? (saving ? "Guardando..." : "Publicar") : "Siguiente"}
        nextDisabled={isNextDisabled()}
      >
        {/* ── PASO 1: Ruta + Qué ───────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* — Ruta — */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">¿Cuál es tu ruta?</h3>
              <LocationAutocomplete
                value={rutaOrigen}
                onChange={(val, coords) => { setRutaOrigen(val); if (coords) setRutaOrigenCoords(coords); }}
                placeholder="Ej: San Marcos Sierras"
                label="Origen"
                enableCurrentLocation
              />
              <LocationAutocomplete
                value={rutaDestino}
                onChange={(val, coords) => { setRutaDestino(val); if (coords) setRutaDestinoCoords(coords); }}
                placeholder="Ej: Córdoba Capital"
                label="Destino"
              />
              <RouteMap origin={rutaOrigenCoords} destination={rutaDestinoCoords} />
            </div>

            {/* — separador — */}
            <div className="border-t border-border" />

            {/* — Qué — */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">¿Qué transportás?</h3>

              <div className="space-y-2.5">
                <OptionCard
                  label="Carga"
                  description="Paquetes, materiales, electrodomésticos"
                  selected={tipoCarga === "carga"}
                  onClick={() => { setTipoCarga("carga"); setTipoVehiculo(""); setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }}
                  icon={<Package className="h-5 w-5 text-primary-foreground" />}
                />
                <OptionCard
                  label="Personas"
                  description="Pasajeros en tu vehículo"
                  selected={tipoCarga === "personas"}
                  onClick={() => { setTipoCarga("personas"); setTipoVehiculo(""); setPosicionPallet(""); setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }}
                  icon={<Users className="h-5 w-5 text-primary-foreground" />}
                />
              </div>

              {/* Tipo de vehículo — aparece al elegir tipo */}
              {tipoCarga && (
                <div ref={revealRef} className="space-y-2.5">
                  <Label className="text-sm font-medium text-foreground">Tipo de vehículo</Label>
                  <div className="space-y-2">
                    {(tipoCarga === "carga"
                      ? ["Camioneta", "Chasis", "Otro"]
                      : ["Camioneta/Auto", "Combi/Van", "Otro"]
                    ).map((v) => (
                      <OptionCard key={v} label={v} selected={tipoVehiculo === v} onClick={() => setTipoVehiculo(v)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Espacio disponible */}
              {tipoCarga && (
                <div className="space-y-2">
                  <Label>
                    {tipoCarga === "personas" ? "Butacas libres (opcional)" : "Metros cúbicos (m³) disponibles"}
                  </Label>
                  <Input
                    type="number"
                    placeholder={tipoCarga === "personas" ? "Ej: 3" : "Ej: 5"}
                    value={espacio}
                    onChange={(e) => setEspacio(e.target.value)}
                  />
                </div>
              )}

              {/* Posición de pallet — solo carga */}
              {tipoCarga === "carga" && (
                <div className="space-y-2">
                  <Label>Posición de pallet (opcional)</Label>
                  <Input
                    placeholder="Ej: 1x1.20"
                    value={posicionPallet}
                    onChange={(e) => setPosicionPallet(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PASO 2: Cuándo + Resumen ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-foreground">¿Cuándo?</h3>

            <FrecuenciaStep value={frecuencia} onChange={setFrecuencia} />

            {/* Resumen previo a publicar */}
            <Card className="rounded-2xl border-border bg-muted/40">
              <CardContent className="p-4 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resumen de tu publicación
                </p>

                {/* Ruta */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="font-medium text-foreground truncate">{rutaOrigen || "—"}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground truncate">{rutaDestino || "—"}</span>
                </div>

                {/* Qué */}
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-foreground">
                    {tipoCarga === "carga" ? "Carga" : tipoCarga === "personas" ? "Personas" : "—"}
                    {tipoVehiculo ? ` · ${tipoVehiculo}` : ""}
                    {espacio ? ` · ${espacio} ${tipoCarga === "personas" ? "butacas" : "m³"}` : ""}
                  </span>
                </div>

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
        )}
      </WizardLayout>
    </AppLayout>
  );
};

export default Transportar;
