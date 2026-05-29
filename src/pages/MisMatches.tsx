import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import SegmentedControl from "@/components/SegmentedControl";
import SwipeAction from "@/components/SwipeAction";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ArrowLeft, MapPin, ArrowRight, Check, X, Inbox, WifiOff, Loader2, Phone, Star } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { getOriginDestination, getOperationMeta, formatDate } from "@/lib/publications";
import { haptic } from "@/lib/haptics";

interface MatchWithDetails {
  id: string;
  status: string;
  created_at: string;
  user_id: string;
  requester_name: string;
  requester_phone: string | null;
  owner_phone: string | null;
  isIncoming: boolean;
  publication: { id: string; operation_type: string; data: Json };
  matched_publication: { id: string; operation_type: string; data: Json } | null;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  accepted: { label: "Aceptado", variant: "default" },
  rejected: { label: "Rechazado", variant: "destructive" },
};

const ACCEPT_BG = "hsl(142 60% 40%)";

const MisMatches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");

  // Rating drawer state
  const [myRatings, setMyRatings] = useState<Map<string, { stars: number; comment: string }>>(new Map());
  const [ratingMatch, setRatingMatch] = useState<MatchWithDetails | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const fetchMatches = async () => {
    if (!user) return;
    setError(false);

    const { data: matchData, error: fetchError } = await supabase
      .from("matches")
      .select("id, status, created_at, user_id, publication_id, matched_publication_id")
      .order("created_at", { ascending: false });

    if (fetchError || !matchData) {
      setError(true);
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

    const incomingIds = new Set(
      matchData.filter((m) => {
        const pub = pubMap.get(m.publication_id);
        return pub && pub.user_id === user.id;
      }).map((m) => m.id)
    );

    const outgoingIds = new Set(matchData.filter((m) => m.user_id === user.id).map((m) => m.id));
    const relevantMatches = matchData.filter((m) => incomingIds.has(m.id) || outgoingIds.has(m.id));

    const requesterIds = [...new Set(relevantMatches.map((m) => m.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", requesterIds);
    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

    // Batch-fetch owner profiles for all publication owners
    const ownerIds = [...new Set(
      relevantMatches.map((m) => pubMap.get(m.publication_id)?.user_id).filter(Boolean) as string[]
    )];
    const { data: ownerProfiles } = await supabase.from("profiles").select("user_id, phone").in("user_id", ownerIds);
    const ownerPhoneMap = new Map(ownerProfiles?.map((p) => [p.user_id, p.phone]) ?? []);

    const result: MatchWithDetails[] = relevantMatches.map((m) => {
      const pub = pubMap.get(m.publication_id);
      const matchedPub = m.matched_publication_id ? pubMap.get(m.matched_publication_id) : null;
      const requesterProfile = profileMap.get(m.user_id);
      return {
        id: m.id,
        status: m.status,
        created_at: m.created_at,
        user_id: m.user_id,
        requester_name: requesterProfile?.full_name || "Usuario",
        requester_phone: requesterProfile?.phone ?? null,
        owner_phone: pub ? (ownerPhoneMap.get(pub.user_id) ?? null) : null,
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

    // Batch-fetch this user's existing ratings for accepted matches
    const acceptedIds = result.filter((m) => m.status === "accepted").map((m) => m.id);
    if (acceptedIds.length > 0) {
      const { data: ratingsData } = await supabase
        .from("ratings")
        .select("match_id, stars, comment")
        .eq("rater_id", user.id)
        .in("match_id", acceptedIds);
      setMyRatings(
        new Map(ratingsData?.map((r) => [r.match_id, { stars: r.stars, comment: r.comment ?? "" }]) ?? [])
      );
    } else {
      setMyRatings(new Map());
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchMatches();

    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdateStatus = async (matchId: string, newStatus: string) => {
    const prev = matches;
    setUpdating(matchId);
    // Actualizar UI inmediatamente
    setMatches((cur) => cur.map((m) => m.id === matchId ? { ...m, status: newStatus } : m));
    haptic(newStatus === "accepted" ? "success" : "warning");
    // Persistir en background
    const { error } = await supabase.from("matches").update({ status: newStatus }).eq("id", matchId);
    setUpdating(null);
    if (error) {
      setMatches(prev); // revertir
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: newStatus === "accepted" ? "¡Match aceptado!" : "Match rechazado" });
  };

  const openRatingDrawer = (m: MatchWithDetails) => {
    const existing = myRatings.get(m.id);
    setRatingStars(existing?.stars ?? 0);
    setRatingComment(existing?.comment ?? "");
    setRatingMatch(m);
  };

  const submitRating = async () => {
    if (!user || !ratingMatch || ratingStars === 0) return;
    setRatingSubmitting(true);
    const { error } = await supabase.from("ratings").insert({
      match_id: ratingMatch.id,
      rater_id: user.id,
      stars: ratingStars,
      comment: ratingComment.trim() || null,
    });
    setRatingSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    haptic("success");
    toast({ title: "¡Gracias por tu calificación!" });
    setMyRatings((prev) =>
      new Map(prev).set(ratingMatch.id, { stars: ratingStars, comment: ratingComment.trim() })
    );
    setRatingMatch(null);
  };

  const renderPubSummary = (pub: { operation_type: string; data: Json }, small?: boolean) => {
    const config = getOperationMeta(pub.operation_type);
    const Icon = config.icon;
    const { origen, destino } = getOriginDestination(pub.data, pub.operation_type);
    return (
      <div className="flex items-center gap-2.5">
        <div className={`flex ${small ? "h-8 w-8" : "h-10 w-10"} shrink-0 items-center justify-center rounded-xl ${config.gradient}`}>
          <Icon className={`${small ? "h-3.5 w-3.5" : "h-5 w-5"} text-primary-foreground`} />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground">{config.label}</span>
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

  const renderStars = (value: number, onChange?: (n: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className="tap-scale disabled:cursor-default"
          aria-label={`${n} estrella${n !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const incoming = matches.filter((m) => m.isIncoming);
  const outgoing = matches.filter((m) => !m.isIncoming);
  const visible = tab === "incoming" ? incoming : outgoing;

  const renderIncomingCard = (m: MatchWithDetails) => {
    const st = statusLabels[m.status] || statusLabels.pending;
    const alreadyRated = myRatings.has(m.id);
    const card = (
      <Card className="rounded-3xl border-border bg-card shadow-card">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{m.requester_name}</span> quiere hacer match
            </span>
            <Badge variant={st.variant} className="shrink-0 rounded-full text-[10px]">{st.label}</Badge>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tu publicación</p>
            {renderPubSummary(m.publication)}
          </div>
          {m.matched_publication && (
            <div className="space-y-1.5 border-t border-border pt-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Su publicación</p>
              {renderPubSummary(m.matched_publication, true)}
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</span>
            {m.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full border-destructive px-3 text-xs text-destructive hover:bg-destructive/10"
                  disabled={updating === m.id}
                  onClick={() => handleUpdateStatus(m.id, "rejected")}
                >
                  {updating === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><X className="mr-1 h-3.5 w-3.5" /> Rechazar</>}
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-full px-3 text-xs"
                  disabled={updating === m.id}
                  onClick={() => handleUpdateStatus(m.id, "accepted")}
                >
                  {updating === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="mr-1 h-3.5 w-3.5" /> Aceptar</>}
                </Button>
              </div>
            )}
          </div>
          {m.status === "accepted" && (
            <>
              <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-green-600" />
                <span className="text-green-700 dark:text-green-400">
                  Coordiná con <span className="font-semibold">{m.requester_name}</span>:{" "}
                  {m.requester_phone || "Sin teléfono registrado"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full rounded-full text-xs"
                onClick={() => openRatingDrawer(m)}
              >
                <Star className="mr-1.5 h-3.5 w-3.5" />
                {alreadyRated ? "Ver calificación" : "Calificar"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );

    if (m.status !== "pending") return <div key={m.id}>{card}</div>;

    return (
      <SwipeAction
        key={m.id}
        right={{ icon: Check, label: "Aceptar", bg: ACCEPT_BG, onAction: () => handleUpdateStatus(m.id, "accepted") }}
        left={{ icon: X, label: "Rechazar", bg: "hsl(var(--destructive))", onAction: () => handleUpdateStatus(m.id, "rejected") }}
      >
        {card}
      </SwipeAction>
    );
  };

  const renderOutgoingCard = (m: MatchWithDetails) => {
    const st = statusLabels[m.status] || statusLabels.pending;
    const alreadyRated = myRatings.has(m.id);
    return (
      <Card key={m.id} className="rounded-3xl border-border shadow-card animate-fade-in">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Enviaste un match</span>
            <Badge variant={st.variant} className="rounded-full text-[10px]">{st.label}</Badge>
          </div>
          {renderPubSummary(m.publication)}
          {m.matched_publication && (
            <div className="border-t border-border pt-3">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tu publicación vinculada</p>
              {renderPubSummary(m.matched_publication, true)}
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</span>
          {m.status === "accepted" && (
            <>
              <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-green-600" />
                <span className="text-green-700 dark:text-green-400">
                  Coordiná con el publicador:{" "}
                  {m.owner_phone || "Sin teléfono registrado"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full rounded-full text-xs"
                onClick={() => openRatingDrawer(m)}
              >
                <Star className="mr-1.5 h-3.5 w-3.5" />
                {alreadyRated ? "Ver calificación" : "Calificar"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const ratingIsReadonly = ratingMatch ? myRatings.has(ratingMatch.id) : false;
  const ratingName = ratingMatch?.isIncoming ? ratingMatch.requester_name : "este match";

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Sub-header */}
        <div className="sticky top-0 z-20 glass px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              onClick={() => navigate("/tablero")}
              aria-label="Volver"
              className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors tap-scale"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h2 className="text-base font-bold text-foreground">Mis Matches</h2>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-lg space-y-4">
            {!loading && !error && matches.length > 0 && (
              <SegmentedControl
                options={[
                  { value: "incoming", label: `Recibidas${incoming.length ? ` (${incoming.length})` : ""}` },
                  { value: "outgoing", label: `Enviadas${outgoing.length ? ` (${outgoing.length})` : ""}` },
                ]}
                value={tab}
                onChange={setTab}
              />
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <WifiOff className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No pudimos cargar tus matches</p>
                <p className="mt-1 text-xs text-muted-foreground">Revisá tu conexión e intentá de nuevo.</p>
                <Button className="mt-5 rounded-full" onClick={() => { setLoading(true); fetchMatches(); }}>Reintentar</Button>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No tenés matches todavía</p>
                <p className="mt-1 text-xs text-muted-foreground">Explorá el tablero y conectá con otros usuarios</p>
                <Button className="mt-5 rounded-full" variant="outline" onClick={() => navigate("/tablero")}>Ir al tablero</Button>
              </div>
            ) : visible.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-foreground">
                  {tab === "incoming" ? "Sin solicitudes recibidas" : "No enviaste matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tab === "incoming" ? "Cuando alguien quiera tu publicación aparecerá acá." : "Hacé match desde el tablero."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tab === "incoming" && (
                  <p className="px-1 text-[11px] text-muted-foreground">Deslizá una tarjeta para aceptar o rechazar.</p>
                )}
                {visible.map((m) => (tab === "incoming" ? renderIncomingCard(m) : renderOutgoingCard(m)))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating drawer */}
      <Drawer open={!!ratingMatch} onOpenChange={(open) => { if (!open) setRatingMatch(null); }}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="flex flex-row items-start justify-between text-left">
            <div>
              <DrawerTitle>
                {ratingIsReadonly ? "Tu calificación" : `Calificar a ${ratingName}`}
              </DrawerTitle>
              <DrawerDescription className="mt-1">
                {ratingIsReadonly
                  ? "Ya calificaste este match."
                  : "Contanos cómo fue la experiencia."}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="space-y-5 px-4 pb-6 safe-bottom">
            {/* Stars */}
            <div className="flex flex-col items-center gap-2 py-2">
              {renderStars(ratingStars, ratingIsReadonly ? undefined : setRatingStars)}
              {ratingStars > 0 && (
                <p className="text-xs text-muted-foreground">
                  {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][ratingStars]}
                </p>
              )}
            </div>

            {/* Comment */}
            {ratingIsReadonly ? (
              ratingComment ? (
                <div className="rounded-2xl bg-muted p-3.5 text-sm text-foreground">
                  "{ratingComment}"
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">Sin comentario</p>
              )
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Comentario opcional
                </label>
                <Textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value.slice(0, 280))}
                  placeholder="¿Cómo fue la experiencia?"
                  className="resize-none rounded-2xl text-sm"
                  rows={3}
                />
                <p className="text-right text-[11px] text-muted-foreground">{ratingComment.length}/280</p>
              </div>
            )}

            {/* Submit */}
            {!ratingIsReadonly && (
              <Button
                className="h-12 w-full rounded-2xl text-sm font-semibold"
                disabled={ratingStars === 0 || ratingSubmitting}
                onClick={submitRating}
              >
                {ratingSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Enviar calificación
                  </>
                )}
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
};

export default MisMatches;
