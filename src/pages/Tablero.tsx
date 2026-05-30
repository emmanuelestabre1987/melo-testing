import { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Inbox, WifiOff, Loader2, ChevronDown, User, Handshake, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Json } from "@/integrations/supabase/types";
import AppLayout from "@/components/AppLayout";
import PullToRefresh from "@/components/PullToRefresh";
import RoutePreview from "@/components/RoutePreview";
import SegmentedControl from "@/components/SegmentedControl";
import TableroFilters, { EMPTY_FILTERS, type PublicationFilters } from "@/components/TableroFilters";
import { getField, getOriginDestination, getCoords, getOperationMeta, formatRelative, formatFrecuencia } from "@/lib/publications";
import { transitionNavigate, prefetch } from "@/lib/viewTransition";
import { cn } from "@/lib/utils";
import MatchDrawer from "@/components/MatchDrawer";

const PublicationsMap = lazy(() => import("@/components/PublicationsMap"));
const loadDetalle = () => import("./PublicacionDetalle");

interface Publication {
  id: string;
  user_id: string;
  operation_type: string;
  data: Json;
  created_at: string;
  status: string;
  profile_name: string;
}

interface MyPub {
  id: string;
  operation_type: string;
  data: Json;
  created_at: string;
}

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "transportar", label: "Transportar" },
  { value: "dar-carga", label: "Dar carga" },
  { value: "viajar", label: "Viajar" },
];

const Tablero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [myPubs, setMyPubs] = useState<MyPub[]>([]);
  const [myPubsOpen, setMyPubsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [filters, setFilters] = useState<PublicationFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<"list" | "map">("list");
  const [matchTarget, setMatchTarget] = useState<Publication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const toastShownRef = useRef(false);

  const fetchPublications = async () => {
    setError(false);
    const { data, error: fetchError } = await supabase
      .from("publications")
      .select("id, operation_type, data, created_at, status, user_id")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError || !data) {
      setError(true);
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
        user_id: p.user_id,
        operation_type: p.operation_type,
        data: p.data,
        created_at: p.created_at,
        status: p.status,
        profile_name: nameMap.get(p.user_id) || "Usuario",
      }))
    );
    setLoading(false);
  };

  const fetchMyPubs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("publications")
      .select("id, operation_type, data, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setMyPubs((data as MyPub[]) || []);
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
        setPendingCount(matchData.filter((m) => myPubIds.has(m.publication_id)).length);
      }
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchPublications(), fetchPendingCount(), fetchMyPubs()]);
  };

  useEffect(() => {
    fetchPublications();
    fetchPendingCount();
    fetchMyPubs();
  }, [user]);

  useEffect(() => {
    if (pendingCount > 0 && !toastShownRef.current) {
      toastShownRef.current = true;
      toast({
        title: `Tenés ${pendingCount} solicitud${pendingCount > 1 ? "es" : ""} de match pendiente${pendingCount > 1 ? "s" : ""}`,
        description: "Revisalas en la pestaña Matches.",
      });
    }
  }, [pendingCount]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

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
    const q = debouncedSearch.toLowerCase();
    return publications.filter((pub) => {
      if (filters.operationType && pub.operation_type !== filters.operationType) return false;
      const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
      if (filters.origen && origen !== filters.origen) return false;
      if (filters.destino && destino !== filters.destino) return false;
      if (q) {
        const label = getOperationMeta(pub.operation_type).label.toLowerCase();
        const haystack = [
          origen, destino, pub.profile_name, label,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [publications, filters, debouncedSearch]);

  const openDetail = (id: string) => transitionNavigate(navigate, `/publicacion/${id}`);

  const controls = (
    <div className="glass border-b border-border/60 px-4 pt-3 pb-2.5 sm:px-6">
      <div className="mx-auto w-full max-w-lg space-y-2.5">
        {/* Category rail */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {CATEGORIES.map((c) => {
            const active = filters.operationType === c.value;
            return (
              <button
                key={c.value || "all"}
                onClick={() => setFilters((f) => ({ ...f, operationType: c.value }))}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors tap-scale",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {/* Search bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por lugar, persona u operación…"
            className="h-9 w-full rounded-full border border-border bg-card pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter pill + view toggle */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <TableroFilters filters={filters} onApply={setFilters} origins={origins} destinations={destinations} />
          </div>
          <SegmentedControl
            className="w-[148px] shrink-0"
            options={[{ value: "list", label: "Lista" }, { value: "map", label: "Mapa" }]}
            value={view}
            onChange={setView}
          />
        </div>
      </div>
    </div>
  );

  const listContent = (
    <div className="px-4 pb-6 sm:px-6">
      <div className="mx-auto w-full max-w-lg pt-3">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Publicaciones</h1>
          <p className="text-xs text-muted-foreground">
            {filtered.length} activa{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== publications.length && ` de ${publications.length}`}
          </p>
        </div>

        {/* Mis publicaciones activas */}
        {myPubs.length > 0 && (
          <div className="mb-4 rounded-3xl border border-border bg-card shadow-card overflow-hidden">
            <button
              onClick={() => setMyPubsOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 tap-scale"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Tus publicaciones activas
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {myPubs.length}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  myPubsOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </button>

            {myPubsOpen && (
              <div className="divide-y divide-border border-t border-border">
                {myPubs.map((pub) => {
                  const config = getOperationMeta(pub.operation_type);
                  const Icon = config.icon;
                  const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
                  const frecuencia = formatFrecuencia(pub.data);
                  const fecha = getField(pub.data, "fecha");
                  const when = frecuencia || fecha;
                  return (
                    <button
                      key={pub.id}
                      onClick={() => openDetail(pub.id)}
                      className="relative w-full px-4 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/70 tap-scale"
                    >
                      {/* "Tuya" badge */}
                      <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Tuya
                      </span>
                      <div className="flex items-center gap-3 pr-12">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.gradient}`}>
                          <Icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold text-foreground">{config.label}</span>
                          {(origen || destino) && (
                            <p className="truncate text-xs text-muted-foreground">
                              {origen || "—"} → {destino || "—"}
                            </p>
                          )}
                          {when && (
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {when}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No pudimos cargar las publicaciones</p>
            <p className="mt-1 text-xs text-muted-foreground">Revisá tu conexión e intentá de nuevo.</p>
            <Button className="mt-5 rounded-full" onClick={() => { setLoading(true); fetchPublications(); }}>
              Reintentar
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {publications.length === 0 ? "No hay publicaciones activas" : "Sin resultados"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {publications.length === 0 ? "Sé el primero en publicar" : "Probá ajustando los filtros"}
            </p>
            {publications.length === 0 ? (
              <Button className="mt-5 rounded-full" onClick={() => navigate("/seleccionar-operacion")}>
                Crear publicación
              </Button>
            ) : (
              <Button variant="outline" className="mt-5 rounded-full" onClick={() => { setFilters(EMPTY_FILTERS); setSearchQuery(""); }}>
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((pub, i) => {
              const config = getOperationMeta(pub.operation_type);
              const Icon = config.icon;
              const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
              const frecuencia = formatFrecuencia(pub.data);
              const fecha = getField(pub.data, "fecha");
              const when = frecuencia || fecha;

              return (
                <Card
                  key={pub.id}
                  onPointerDown={() => prefetch(loadDetalle)}
                  onClick={() => openDetail(pub.id)}
                  className="cursor-pointer overflow-hidden rounded-3xl border-border shadow-card transition-all animate-fade-in hover:shadow-card-hover active:scale-[0.98]"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.gradient}`}>
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">{config.label}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelative(pub.created_at)}</span>
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">por {pub.profile_name}</p>
                      </div>
                    </div>

                    {(origen || destino) && (
                      <div className="mt-3 rounded-2xl bg-muted/60 px-3.5 py-3">
                        <RoutePreview origen={origen} destino={destino} />
                      </div>
                    )}

                    {when && (
                      <div className="mt-2.5 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {when}
                      </div>
                    )}

                    {user && pub.user_id !== user.id && (
                      <div className="mt-3 border-t border-border pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-full rounded-full text-xs"
                          onClick={(e) => { e.stopPropagation(); setMatchTarget(pub); }}
                        >
                          <Handshake className="mr-1.5 h-3.5 w-3.5" />
                          Hacer match
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout pendingCount={pendingCount}>
      <div className="flex h-full flex-col">
        {controls}
        <div className="min-h-0 flex-1">
          {view === "map" ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              }
            >
              <PublicationsMap publications={filtered} onSelect={openDetail} />
            </Suspense>
          ) : (
            <PullToRefresh onRefresh={handleRefresh}>{listContent}</PullToRefresh>
          )}
        </div>
      </div>

      <MatchDrawer
        target={matchTarget}
        open={!!matchTarget}
        onOpenChange={(open) => { if (!open) setMatchTarget(null); }}
      />
    </AppLayout>
  );
};

export default Tablero;
