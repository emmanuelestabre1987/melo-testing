import { useState, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import OptionCard from "@/components/OptionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Box, Boxes, MapPin, ArrowRight, Calendar } from "lucide-react";
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

  // Paso 1 — Ruta
  const [origen, setOrigen] = useState("");
  const [origenCoords, setOrigenCoords] = useState<Coords>();
  const [destino, setDestino] = useState("");
  const [destinoCoords, setDestinoCoords] = useState<Coords>();

  // Paso 1 — Qué enviás
  const [tipoEnvio, setTipoEnvio] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [unidad, setUnidad] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [m3, setM3] = useState("");

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
      case 1:
        return (
          !origen || !destino ||
          !tipoEnvio || !tipoCarga ||
          (tipoEnvio === "encomienda" && !m3) ||
          (tipoEnvio === "carga-general" && (!unidad || !cantidad ||
            (unidad === "bultos" && !m3)))
        );
      case 2: return !isFrecuenciaValid(frecuencia);
      default: return false;
    }
  };

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
        {/* ── PASO 1: Ruta + Qué enviás ────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* — Ruta — */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">¿Cuál es tu ruta?</h3>
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
            </div>

            {/* — separador — */}
            <div className="border-t border-border" />

            {/* — Qué enviás — */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">¿Qué enviás?</h3>

              {/* Tipo de envío */}
              <div className="space-y-2.5">
                <OptionCard
                  label="Encomienda"
                  description="Paquete pequeño/mediano"
                  selected={tipoEnvio === "encomienda"}
                  onClick={() => { setTipoEnvio("encomienda"); setUnidad(""); setCantidad(""); setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }}
                  icon={<Package className="h-5 w-5 text-primary-foreground" />}
                />
                <OptionCard
                  label="Carga general"
                  description="Materiales, muebles, maquinaria"
                  selected={tipoEnvio === "carga-general"}
                  onClick={() => { setTipoEnvio("carga-general"); setM3(""); setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }}
                  icon={<Boxes className="h-5 w-5 text-primary-foreground" />}
                />
              </div>

              {/* Tipo de carga — aparece al elegir envío */}
              {tipoEnvio && (
                <div ref={revealRef} className="space-y-2.5">
                  <Label className="text-sm font-medium text-foreground">Tipo de carga</Label>
                  <div className="space-y-2">
                    {["Electrodomésticos", "Materiales de construcción", "Maquinaria/Herramientas", "Alimentos", "Otros"].map((t) => (
                      <OptionCard key={t} label={t} selected={tipoCarga === t} onClick={() => setTipoCarga(t)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Encomienda: m³ */}
              {tipoEnvio === "encomienda" && (
                <div className="space-y-2">
                  <Label>m³ aproximados</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 0.5"
                    value={m3}
                    onChange={(e) => setM3(e.target.value)}
                  />
                </div>
              )}

              {/* Carga general: unidad + cantidad + m³ si bultos */}
              {tipoEnvio === "carga-general" && (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium text-foreground">Unidad</Label>
                    <div className="space-y-2">
                      <OptionCard
                        label="Pallets"
                        selected={unidad === "pallets"}
                        onClick={() => { setUnidad("pallets"); setM3(""); }}
                        icon={<Box className="h-5 w-5 text-primary-foreground" />}
                      />
                      <OptionCard
                        label="Bultos"
                        selected={unidad === "bultos"}
                        onClick={() => setUnidad("bultos")}
                        icon={<Package className="h-5 w-5 text-primary-foreground" />}
                      />
                    </div>
                  </div>

                  {unidad && (
                    <div className="space-y-2">
                      <Label>{unidad === "pallets" ? "Cantidad de pallets" : "Cantidad de bultos"}</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 2"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                      />
                    </div>
                  )}

                  {unidad === "bultos" && (
                    <div className="space-y-2">
                      <Label>m³ aproximados</Label>
                      <Input
                        type="number"
                        placeholder="Ej: 1.5"
                        value={m3}
                        onChange={(e) => setM3(e.target.value)}
                      />
                    </div>
                  )}
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
                  <span className="font-medium text-foreground truncate">{origen || "—"}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground truncate">{destino || "—"}</span>
                </div>

                {/* Qué */}
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-foreground">
                    {tipoEnvio === "encomienda" ? "Encomienda" : "Carga general"}
                    {tipoCarga ? ` · ${tipoCarga}` : ""}
                    {tipoEnvio === "encomienda" && m3 ? ` · ${m3} m³` : ""}
                    {tipoEnvio === "carga-general" && cantidad && unidad
                      ? ` · ${cantidad} ${unidad}${m3 ? ` · ${m3} m³` : ""}`
                      : ""}
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

export default DarCarga;
