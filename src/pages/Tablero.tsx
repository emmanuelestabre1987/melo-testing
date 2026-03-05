import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, Users, MapPin, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Json } from "@/integrations/supabase/types";
import AppLayout from "@/components/AppLayout";
import TableroFilters, { EMPTY_FILTERS, type PublicationFilters } from "@/components/TableroFilters";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [filters, setFilters] = useState<PublicationFilters>(EMPTY_FILTERS);
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
        const count = matchData.filter((m) => myPubIds.has(m.publication_id)).length;
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

  const { origins, destinations } = useMemo(() => {
    const origSet = new Set<string>();
    const destSet = new Set<string>();
    publications.forEach((pub) => {
      const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
      if (origen) origSet.add(origen);
      if (destino) destSet.add(destino);
    });
    return { origins: [...origSet].sort(), destinations: [...destSet].sort() };
  }, [publications]);

  const filtered = useMemo(() => {
    return publications.filter((pub) => {
      if (filters.operationType && pub.operation_type !== filters.operationType) return false;
      const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
      if (filters.origen && origen !== filters.origen) return false;
      if (filters.destino && destino !== filters.destino) return false;
      return true;
    });
  }, [publications, filters]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const filterSlot = (
    <TableroFilters
      filters={filters}
      onApply={setFilters}
      origins={origins}
      destinations={destinations}
    />
  );

  return (
    <AppLayout pendingCount={pendingCount} onRefresh={fetchPublications} filterSlot={filterSlot}>
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Publicaciones activas
              {filtered.length !== publications.length && ` (${filtered.length}/${publications.length})`}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 sm:h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/40" />
              <p className="mt-3 sm:mt-4 text-sm text-muted-foreground">
                {publications.length === 0 ? "No hay publicaciones activas" : "No hay publicaciones que coincidan con los filtros"}
              </p>
              {publications.length === 0 && (
                <Button className="mt-4" onClick={() => navigate("/seleccionar-operacion")}>
                  Crear publicación
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {filtered.map((pub) => {
                const config = operationConfig[pub.operation_type] || operationConfig.viajar;
                const Icon = config.icon;
                const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
                const frecuencia = getField(pub.data, "frecuencia");
                const fecha = getField(pub.data, "fecha");

                return (
                  <Card key={pub.id} className="overflow-hidden border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer active:scale-[0.98]" onClick={() => navigate(`/publicacion/${pub.id}`)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${config.gradient}`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                              {config.label}
                            </Badge>
                            <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{formatDate(pub.created_at)}</span>
                          </div>
                          {(origen || destino) && (
                            <div className="mt-1.5 sm:mt-2 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-foreground">
                              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate">{origen || "—"}</span>
                              <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-muted-foreground" />
                              <span className="truncate">{destino || "—"}</span>
                            </div>
                          )}
                          <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">por {pub.profile_name} · {pub.id.slice(0, 8).toUpperCase()}</span>
                            {(frecuencia || fecha) && (
                              <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground shrink-0">
                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
    </AppLayout>
  );
};

export default Tablero;
