import { useEffect, useState } from "react";
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
  viajar: { label: "Viajar", icon: Users, gradient: "gradient-primary" },
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
    // Load user's own publications for linking
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-muted-foreground">Publicación no encontrada</p>
        <Button className="mt-4" onClick={() => navigate("/tablero")}>Volver al tablero</Button>
      </div>
    );
  }

  const config = operationConfig[pub.operation_type] || operationConfig.viajar;
  const Icon = config.icon;
  const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
  const isOwn = user?.id === pub.user_id;

  // Build detail fields from data, excluding ruta (handled separately)
  const detailFields: { label: string; value: string }[] = [];
  if (pub.data && typeof pub.data === "object" && !Array.isArray(pub.data)) {
    const d = pub.data as Record<string, Json | undefined>;
    for (const [key, val] of Object.entries(d)) {
      if (key === "ruta" || key === "origen" || key === "destino") continue;
      const label = fieldLabels[key] || key;
      let value = "";
      if (typeof val === "string") value = val;
      else if (typeof val === "number") value = String(val);
      if (value) detailFields.push({ label, value });
    }
  }

  const shortId = pub.id.slice(0, 8).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button onClick={() => navigate("/tablero")} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Detalle de publicación</h2>
            <p className="text-xs text-muted-foreground">ID: {shortId}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(pub.id); toast({ title: "ID copiado" }); }}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Main card */}
          <Card className="border-border shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.gradient}`}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <Badge variant="secondary">{config.label}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">por {profileName}</p>
                </div>
              </div>

              {(origen || destino) && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-medium">{origen || "—"}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{destino || "—"}</span>
                </div>
              )}

              {detailFields.length > 0 && (
                <div className="mt-4 space-y-2">
                  {detailFields.map((f) => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-medium text-foreground">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(pub.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </CardContent>
          </Card>

          {/* Match button */}
          <Button onClick={handleMatchClick} className="w-full" size="lg">
            <Handshake className="mr-2 h-5 w-5" />
            Hacer match
          </Button>
        </div>
      </div>

      {/* Match dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hacer match</DialogTitle>
            <DialogDescription>
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
                      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mConfig.gradient}`}>
                        <MIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-foreground">{mConfig.label}</span>
                        {(mOrigen || mDestino) && (
                          <p className="text-xs text-muted-foreground truncate">{mOrigen} → {mDestino}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{mp.id.slice(0, 8).toUpperCase()}</span>
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
              className="w-full"
              onClick={() => {
                setMatchDialogOpen(false);
                navigate("/seleccionar-operacion");
              }}
            >
              + Crear publicación para hacer match
            </Button>
            <Button
              className="w-full"
              onClick={() => createMatch()}
              disabled={loadingMatch}
            >
              <Handshake className="mr-2 h-4 w-4" />
              {loadingMatch ? "Enviando..." : "Match sin vincular publicación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicacionDetalle;
