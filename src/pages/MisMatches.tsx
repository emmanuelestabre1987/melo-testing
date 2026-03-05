import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, Package, Users, MapPin, ArrowRight, Check, X } from "lucide-react";
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

interface MatchWithDetails {
  id: string;
  status: string;
  created_at: string;
  user_id: string;
  requester_name: string;
  isIncoming: boolean;
  publication: {
    id: string;
    operation_type: string;
    data: Json;
  };
  matched_publication: {
    id: string;
    operation_type: string;
    data: Json;
  } | null;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  accepted: { label: "Aceptado", variant: "default" },
  rejected: { label: "Rechazado", variant: "destructive" },
};

const MisMatches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchMatches = async () => {
    if (!user) return;
    setLoading(true);

    const { data: matchData, error } = await supabase
      .from("matches")
      .select("id, status, created_at, user_id, publication_id, matched_publication_id")
      .order("created_at", { ascending: false });

    if (error || !matchData) {
      setLoading(false);
      return;
    }

    const pubIds = [...new Set(matchData.map((m) => m.publication_id))];
    const matchedPubIds = matchData.map((m) => m.matched_publication_id).filter(Boolean) as string[];
    const allPubIds = [...new Set([...pubIds, ...matchedPubIds])];

    const { data: pubs } = await supabase
      .from("publications")
      .select("id, operation_type, data, user_id")
      .in("id", allPubIds);

    const pubMap = new Map(pubs?.map((p) => [p.id, p]) ?? []);

    // Determine which matches are incoming (user owns the target publication)
    const incomingIds = new Set(
      matchData
        .filter((m) => {
          const pub = pubMap.get(m.publication_id);
          return pub && pub.user_id === user.id;
        })
        .map((m) => m.id)
    );

    // Outgoing: matches user sent
    const outgoingIds = new Set(matchData.filter((m) => m.user_id === user.id).map((m) => m.id));

    // All relevant = incoming OR outgoing
    const relevantMatches = matchData.filter((m) => incomingIds.has(m.id) || outgoingIds.has(m.id));

    // Fetch requester names
    const requesterIds = [...new Set(relevantMatches.map((m) => m.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", requesterIds);
    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) ?? []);

    const result: MatchWithDetails[] = relevantMatches.map((m) => {
      const pub = pubMap.get(m.publication_id);
      const matchedPub = m.matched_publication_id ? pubMap.get(m.matched_publication_id) : null;
      return {
        id: m.id,
        status: m.status,
        created_at: m.created_at,
        user_id: m.user_id,
        requester_name: nameMap.get(m.user_id) || "Usuario",
        isIncoming: incomingIds.has(m.id),
        publication: pub
          ? { id: pub.id, operation_type: pub.operation_type, data: pub.data }
          : { id: m.publication_id, operation_type: "viajar", data: {} as Json },
        matched_publication: matchedPub
          ? { id: matchedPub.id, operation_type: matchedPub.operation_type, data: matchedPub.data }
          : null,
      };
    });

    setMatches(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const handleUpdateStatus = async (matchId: string, newStatus: string) => {
    setUpdating(matchId);
    const { error } = await supabase
      .from("matches")
      .update({ status: newStatus })
      .eq("id", matchId);
    setUpdating(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: newStatus === "accepted" ? "¡Match aceptado!" : "Match rechazado" });
    fetchMatches();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const renderPubSummary = (pub: { operation_type: string; data: Json }, small?: boolean) => {
    const config = operationConfig[pub.operation_type] || operationConfig.viajar;
    const Icon = config.icon;
    const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
    return (
      <div className="flex items-center gap-2">
        <div className={`flex ${small ? "h-7 w-7" : "h-9 w-9"} shrink-0 items-center justify-center rounded-lg ${config.gradient}`}>
          <Icon className={`${small ? "h-3.5 w-3.5" : "h-4 w-4"} text-primary-foreground`} />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-medium text-foreground">{config.label}</span>
          {(origen || destino) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{origen || "—"}</span>
              <ArrowRight className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{destino || "—"}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const incoming = matches.filter((m) => m.isIncoming);
  const outgoing = matches.filter((m) => !m.isIncoming);

  return (
    <AppLayout>
    <div className="flex flex-col bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button onClick={() => navigate("/tablero")} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">Mis Matches</h2>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No tenés matches todavía</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate("/tablero")}>
                Ir al tablero
              </Button>
            </div>
          ) : (
            <>
              {incoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Solicitudes recibidas</h3>
                  {incoming.map((m) => {
                    const st = statusLabels[m.status] || statusLabels.pending;
                    return (
                      <Card key={m.id} className="border-border shadow-card">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{m.requester_name}</span> quiere hacer match
                            </span>
                            <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tu publicación</p>
                            {renderPubSummary(m.publication)}
                          </div>

                          {m.matched_publication && (
                            <div className="space-y-2 border-t border-border pt-2">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Su publicación</p>
                              {renderPubSummary(m.matched_publication, true)}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</span>
                            {m.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 px-3 text-xs"
                                  disabled={updating === m.id}
                                  onClick={() => handleUpdateStatus(m.id, "rejected")}
                                >
                                  <X className="mr-1 h-3.5 w-3.5" /> Rechazar
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  disabled={updating === m.id}
                                  onClick={() => handleUpdateStatus(m.id, "accepted")}
                                >
                                  <Check className="mr-1 h-3.5 w-3.5" /> Aceptar
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {outgoing.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Matches enviados</h3>
                  {outgoing.map((m) => {
                    const st = statusLabels[m.status] || statusLabels.pending;
                    return (
                      <Card key={m.id} className="border-border shadow-card">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Enviaste un match</span>
                            <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                          </div>
                          {renderPubSummary(m.publication)}
                          {m.matched_publication && (
                            <div className="border-t border-border pt-2">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tu publicación vinculada</p>
                              {renderPubSummary(m.matched_publication, true)}
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default MisMatches;
