import { useEffect, useState, lazy, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatefulButton, { type ButtonStatus } from "@/components/StatefulButton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ArrowLeft, MapPin, ArrowRight, Calendar, Copy, Handshake, WifiOff, X, Loader2, Check, CheckCircle2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { getOriginDestination, getCoords, getOperationMeta, fieldLabels, formatFrecuencia } from "@/lib/publications";
import { transitionNavigate } from "@/lib/viewTransition";
import { haptic } from "@/lib/haptics";

const RouteMap = lazy(() => import("@/components/RouteMap"));

interface PubRow {
  id: string;
  user_id: string;
  operation_type: string;
  data: Json;
  created_at: string;
  status: string;
}

interface MyPub {
  id: string;
  operation_type: string;
  data: Json;
  created_at: string;
}

const PublicacionDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pub, setPub] = useState<PubRow | null>(null);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [myPublications, setMyPublications] = useState<MyPub[]>([]);
  const [matchStatus, setMatchStatus] = useState<ButtonStatus>("idle");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [completeStatus, setCompleteStatus] = useState<ButtonStatus>("idle");

  const fetchDetail = async () => {
    if (!id) return;
    setError(false);
    const { data, error: fetchError } = await supabase.from("publications").select("*").eq("id", id).single();
    if (fetchError || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setPub(data as PubRow);
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", data.user_id).single();
    setProfileName(profile?.full_name || "Usuario");
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const goBack = () => transitionNavigate(navigate, "/tablero");
  const isOwner = !!user && !!pub && pub.user_id === user.id;

  const handleMatchClick = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("publications")
      .select("id, operation_type, data, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setMyPublications((data as MyPub[]) || []);
    setMatchDialogOpen(true);
  };

  const handleComplete = async () => {
    if (!pub) return;
    if (pub.status === "completed") {
      toast({ title: "Ya está completada" });
      return;
    }
    setCompleteStatus("loading");
    const { error } = await supabase
      .from("publications")
      .update({ status: "completed" })
      .eq("id", pub.id);
    if (error) {
      setCompleteStatus("idle");
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    haptic("success");
    setCompleteStatus("success");
    setTimeout(() => navigate("/tablero"), 1500);
  };

  const handleDelete = async () => {
    if (!pub) return;
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    setDeleteLoading(true);
    const { error } = await supabase.from("publications").delete().eq("id", pub.id);
    if (error) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
      setDeleteLoading(false);
      return;
    }
    haptic("warning");
    toast({ title: "Publicación eliminada" });
    navigate("/tablero");
  };

  const createMatch = async (myPubId?: string) => {
    if (!user || !id) return;
    // Respuesta inmediata
    setMatchDialogOpen(false);
    setMatchStatus("success");
    haptic("success");
    toast({ title: "¡Match enviado!", description: "Tu solicitud fue registrada." });
    // Persistir en background
    const { error } = await supabase.from("matches").insert({
      publication_id: id,
      matched_publication_id: myPubId || null,
      user_id: user.id,
    });
    if (error) {
      setMatchStatus("idle");
      toast({ title: "No se pudo enviar el match", description: error.message, variant: "destructive" });
      return;
    }
    setTimeout(() => setMatchStatus("idle"), 1800);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !pub) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No pudimos cargar la publicación</p>
          <p className="mt-1 text-xs text-muted-foreground">Puede que ya no exista o falló la conexión.</p>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/tablero")}>Volver al tablero</Button>
            <Button className="rounded-full" onClick={() => { setLoading(true); fetchDetail(); }}>Reintentar</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const config = getOperationMeta(pub.operation_type);
  const Icon = config.icon;
  const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
  const { origin: originCoords, destination: destCoords } = getCoords(pub.data, pub.operation_type);
  const hasMap = !!(originCoords || destCoords);

  const detailFields: { label: string; value: string }[] = [];
  if (pub.data && typeof pub.data === "object" && !Array.isArray(pub.data)) {
    const d = pub.data as Record<string, Json | undefined>;
    for (const [key, val] of Object.entries(d)) {
      if (["ruta", "origen", "destino", "origenCoords", "destinoCoords", "frecuencia"].includes(key)) continue;
      const label = fieldLabels[key] || key;
      let value = "";
      if (typeof val === "string") value = val;
      else if (typeof val === "number") value = String(val);
      if (value) detailFields.push({ label, value });
    }
    const frecuenciaStr = formatFrecuencia(pub.data);
    if (frecuenciaStr) detailFields.push({ label: "Frecuencia", value: frecuenciaStr });
  }

  const shortId = pub.id.slice(0, 8).toUpperCase();

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* Sub-header */}
        <div className="shrink-0 glass px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              onClick={goBack}
              aria-label="Volver"
              className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors tap-scale"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground">Detalle</h2>
              <p className="text-xs text-muted-foreground">ID: {shortId}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(pub.id); haptic("light"); toast({ title: "ID copiado" }); }}
              aria-label="Copiar ID"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors tap-scale"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-lg space-y-4">
            <Card className="rounded-3xl border-border shadow-card animate-fade-in">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${config.gradient}`}>
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-foreground">{config.label}</span>
                      {pub.status === "completed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Completada
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">por {profileName}</p>
                  </div>
                </div>

                {(origen || destino) && (
                  <div className="flex items-center gap-2 rounded-2xl bg-muted p-3.5 text-sm text-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate font-medium">{origen || "—"}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{destino || "—"}</span>
                  </div>
                )}

                {detailFields.length > 0 && (
                  <div className="mt-4 space-y-3">
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

            {hasMap && (
              <Card className="overflow-hidden rounded-3xl border-border shadow-card">
                <CardContent className="p-3">
                  <Suspense fallback={<div className="flex h-[200px] items-center justify-center rounded-2xl bg-muted"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
                    <RouteMap origin={originCoords} destination={destCoords} />
                  </Suspense>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Thumb-zone CTA */}
        {!isOwner && (
          <div className="shrink-0 glass border-t border-border px-4 py-3 safe-bottom sm:px-6">
            <div className="mx-auto max-w-lg">
              <StatefulButton
                status={matchStatus}
                onClick={handleMatchClick}
                loadingText="Enviando..."
                successText="¡Match enviado!"
                className="h-14 w-full rounded-2xl text-base font-semibold tap-scale"
              >
                <Handshake className="mr-2 h-5 w-5" />
                Hacer match
              </StatefulButton>
            </div>
          </div>
        )}
        {isOwner && pub.status !== "completed" && (
          <div className="shrink-0 glass border-t border-border px-4 py-3 safe-bottom sm:px-6">
            <div className="mx-auto flex max-w-lg gap-3">
              <Button
                variant="outline"
                className="h-14 flex-1 rounded-2xl border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Eliminar publicación"}
              </Button>
              <StatefulButton
                status={completeStatus}
                onClick={handleComplete}
                loadingText="Guardando..."
                successText="¡Completada!"
                className="h-14 flex-1 rounded-2xl"
              >
                <Check className="mr-2 h-5 w-5" />
                Completar
              </StatefulButton>
            </div>
          </div>
        )}

        {/* Match bottom sheet */}
        <Drawer open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex flex-row items-start justify-between text-left">
              <div>
                <DrawerTitle>Hacer match</DrawerTitle>
                <DrawerDescription className="mt-1">
                  Vinculá una de tus publicaciones o creá una nueva para conectar con esta oferta.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full" aria-label="Cerrar">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className="space-y-3 overflow-y-auto px-4 pb-4 safe-bottom">
              {myPublications.length > 0 && (
                <>
                  <p className="text-sm font-medium text-foreground">Tus publicaciones activas</p>
                  {myPublications.map((mp) => {
                    const mConfig = getOperationMeta(mp.operation_type);
                    const MIcon = mConfig.icon;
                    const { origen: mO, destino: mD } = getOriginDestination(mp.data, mp.operation_type);
                    return (
                      <button
                        key={mp.id}
                        onClick={() => createMatch(mp.id)}
                        disabled={matchStatus === "loading"}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border p-3.5 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 tap-scale"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mConfig.gradient}`}>
                          <MIcon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground">{mConfig.label}</span>
                          {(mO || mD) && <p className="truncate text-xs text-muted-foreground">{mO} → {mD}</p>}
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
                className="h-12 w-full rounded-2xl"
                onClick={() => { setMatchDialogOpen(false); navigate("/seleccionar-operacion"); }}
              >
                + Crear publicación para hacer match
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </AppLayout>
  );
};

export default PublicacionDetalle;
