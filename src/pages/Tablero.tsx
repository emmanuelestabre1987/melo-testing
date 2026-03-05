import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, Users, MapPin, ArrowRight, Calendar, RefreshCw, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Json } from "@/integrations/supabase/types";

interface Publication {
  id: string;
  operation_type: string;
  data: Json;
  created_at: string;
  status: string;
  profile_name: string;
}

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

const Tablero = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const toastShownRef = useRef(false);

  const fetchPublications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("publications")
      .select("id, operation_type, data, created_at, status, user_id")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Fetch profile names
    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) ?? []);

    setPublications(
      data.map((p) => ({
        id: p.id,
        operation_type: p.operation_type,
        data: p.data,
        created_at: p.created_at,
        status: p.status,
        profile_name: nameMap.get(p.user_id) || "Usuario",
      }))
    );
    setLoading(false);
  };

  const fetchPendingCount = async () => {
    if (!user) return;
    // Get matches on my publications that are pending
    const { data: matchData } = await supabase
      .from("matches")
      .select("id, publication_id, user_id, status")
      .eq("status", "pending");
    if (matchData) {
      const pubIds = [...new Set(matchData.map((m) => m.publication_id))];
      if (pubIds.length > 0) {
        const { data: pubs } = await supabase
          .from("publications")
          .select("id, user_id")
          .in("id", pubIds);
        const myPubIds = new Set(pubs?.filter((p) => p.user_id === user.id).map((p) => p.id) ?? []);
        const count = matchData.filter((m) => myPubIds.has(m.publication_id) && m.user_id !== user.id).length;
        setPendingCount(count);
      }
    }
  };

  useEffect(() => {
    fetchPublications();
    fetchPendingCount();
  }, []);

  useEffect(() => {
    if (pendingCount > 0 && !toastShownRef.current) {
      toastShownRef.current = true;
      toast({
        title: `Tenés ${pendingCount} solicitud${pendingCount > 1 ? "es" : ""} de match pendiente${pendingCount > 1 ? "s" : ""}`,
        description: "Tocá la campana 🔔 para revisarlas.",
      });
    }
  }, [pendingCount]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tablero</h1>
            <p className="text-sm text-muted-foreground">Publicaciones activas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/mis-matches")}>
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={fetchPublications}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => navigate("/seleccionar-operacion")}>
              + Publicar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No hay publicaciones activas</p>
            <Button className="mt-4" onClick={() => navigate("/seleccionar-operacion")}>
              Crear publicación
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {publications.map((pub) => {
              const config = operationConfig[pub.operation_type] || operationConfig.viajar;
              const Icon = config.icon;
              const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
              const frecuencia = getField(pub.data, "frecuencia");
              const fecha = getField(pub.data, "fecha");

              return (
                <Card key={pub.id} className="overflow-hidden border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer" onClick={() => navigate(`/publicacion/${pub.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.gradient}`}>
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(pub.created_at)}</span>
                        </div>
                        {(origen || destino) && (
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{origen || "—"}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{destino || "—"}</span>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">por {pub.profile_name} · {pub.id.slice(0, 8).toUpperCase()}</span>
                          {(frecuencia || fecha) && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {frecuencia || fecha}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tablero;
