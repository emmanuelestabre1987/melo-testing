import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, ArrowRight, Calendar, Truck, Package, Users, Copy, Handshake } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const operationConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  transportar: { label: "Transportar", icon: Truck, gradient: "gradient-primary" },
  "dar-carga": { label: "Dar carga", icon: Package, gradient: "gradient-warm" },
  viajar: { label: "Viajar", icon: Users, gradient: "gradient-cta" },
};

const getField = (data: Json, key: string): string => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const val = (data as Record<string, Json | undefined>)[key];
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
  }
  return "";
};

const getOriginDestination = (data: Json, opType: string) => {
  if (opType === "transportar") {
    const ruta = data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, Json | undefined>).ruta : null;
    return {
      origen: ruta ? getField(ruta as Json, "origen") : "",
      destino: ruta ? getField(ruta as Json, "destino") : "",
    };
  }
  return { origen: getField(data, "origen"), destino: getField(data, "destino") };
};

const fieldLabels: Record<string, string> = {
  tipoCarga: "Tipo de carga",
  tipoVehiculo: "Vehículo",
  frecuencia: "Frecuencia",
  espacio: "Espacio disponible",
  posicionPallet: "Posición pallet",
  tipoEnvio: "Tipo de envío",
  unidad: "Unidad",
  cantidad: "Cantidad",
  m3: "Volumen (m³)",
  cantidadPersonas: "Personas",
  fecha: "Fecha",
};

const PublicacionDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pub, setPub] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [myPublications, setMyPublications] = useState<any[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("publications")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setPub(data);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", data.user_id)
          .single();
        setProfileName(profile?.full_name || "Usuario");
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleMatchClick = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("publications")
      .select("id, operation_type, data, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setMyPublications(data || []);
    setMatchDialogOpen(true);
  };

  const createMatch = async (myPubId?: string) => {
    if (!user || !id) return;
    setLoadingMatch(true);
    const { error } = await supabase.from("matches").insert({
      publication_id: id,
      matched_publication_id: myPubId || null,
      user_id: user.id,
    });
    setLoadingMatch(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "¡Match enviado!", description: "Tu solicitud de match fue registrada." });
    setMatchDialogOpen(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!pub) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-muted-foreground">Publicación no encontrada</p>
          <Button className="mt-4 rounded-xl" onClick={() => navigate("/tablero")}>Volver al tablero</Button>
        </div>
      </AppLayout>
    );
  }

  const config = operationConfig[pub.operation_type] || operationConfig.viajar;
  const Icon = config.icon;
  const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);

  const detailFields: { label: string; value: string }[] = [];
  if (pub.data && typeof pub.data === "object" && !Array.isArray(pub.data)) {
    const d = pub.data as Record<string, Json | undefined>;
    for (const [key, val] of Object.entries(d)) {
      if (key === "ruta" || key === "origen" || key === "destino" || key === "origenCoords" || key === "destinoCoords") continue;
      const label = fieldLabels[key] || key;
      let value = "";
      if (typeof val === "string") value = val;
      else if (typeof val === "number") value = String(val);
      if (value) detailFields.push({ label, value });
    }
  }

  const shortId = pub.id.slice(0, 8).toUpperCase();

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Sub-header */}
        <div className="bg-background px-4 sm:px-6 py-3">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button onClick={() => navigate("/tablero")} className="rounded-xl p-2 hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground">Detalle</h2>
              <p className="text-xs text-muted-foreground">ID: {shortId}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(pub.id); toast({ title: "ID copiado" }); }}
              className="rounded-xl p-2 hover:bg-muted transition-colors"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4">
          <div className="mx-auto max-w-lg space-y-4">
            <Card className="border-border rounded-2xl shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.gradient}`}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-[10px] font-medium rounded-full px-2.5">{config.label}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">por {profileName}</p>
                  </div>
                </div>

                {(origen || destino) && (
                  <div className="flex items-center gap-2 rounded-xl bg-muted p-3.5 text-sm text-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium truncate">{origen || "—"}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate">{destino || "—"}</span>
                  </div>
                )}

                {detailFields.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {detailFields.map((f) => (
                      <div key={f.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="font-medium text-foreground">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(pub.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleMatchClick} className="w-full h-12 rounded-xl font-semibold">
              <Handshake className="mr-2 h-5 w-5" />
              Hacer match
            </Button>
          </div>
        </div>

        {/* Match dialog */}
        <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Hacer match</DialogTitle>
              <DialogDescription className="text-sm">
                Vinculá una de tus publicaciones o creá una nueva para hacer match con esta oferta.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {myPublications.length > 0 && (
                <>
                  <p className="text-sm font-medium text-foreground">Tus publicaciones activas:</p>
                  {myPublications.map((mp) => {
                    const mConfig = operationConfig[mp.operation_type] || operationConfig.viajar;
                    const MIcon = mConfig.icon;
                    const { origen: mOrigen, destino: mDestino } = getOriginDestination(mp.data, mp.operation_type);
                    return (
                      <button
                        key={mp.id}
                        onClick={() => createMatch(mp.id)}
                        disabled={loadingMatch}
                        className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mConfig.gradient}`}>
                          <MIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-foreground">{mConfig.label}</span>
                          {(mOrigen || mDestino) && (
                            <p className="text-xs text-muted-foreground truncate">{mOrigen} → {mDestino}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center"><span className="bg-background px-2 text-xs text-muted-foreground">o</span></div>
                  </div>
                </>
              )}
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => {
                  setMatchDialogOpen(false);
                  navigate("/seleccionar-operacion");
                }}
              >
                + Crear publicación para hacer match
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default PublicacionDetalle;
