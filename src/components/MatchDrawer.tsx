import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { X, Loader2, Info } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { getOriginDestination, getOperationMeta } from "@/lib/publications";
import { areCompatible, getComplementaryTarget } from "@/lib/matching";
import { haptic } from "@/lib/haptics";

interface MatchTarget {
  id: string;
  operation_type: string;
  data: Json;
}

interface MyPub {
  id: string;
  operation_type: string;
  data: Json;
  created_at: string;
}

interface MatchDrawerProps {
  /** La publicación con la que el usuario quiere hacer match. */
  target: MatchTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Llamado justo antes de cerrar el drawer, cuando el match se envió. */
  onMatchSent?: () => void;
}

const MatchDrawer = ({ target, open, onOpenChange, onMatchSent }: MatchDrawerProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [myPubs, setMyPubs] = useState<MyPub[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [matching, setMatching] = useState(false);

  // Traer publicaciones del usuario cada vez que se abre
  useEffect(() => {
    if (!open || !user || !target) return;
    setLoadingPubs(true);
    supabase
      .from("publications")
      .select("id, operation_type, data, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMyPubs((data as MyPub[]) || []);
        setLoadingPubs(false);
      });
  }, [open, target?.id, user?.id]);

  // Publicaciones del usuario compatibles con la target
  const compatible = target
    ? myPubs.filter((mp) =>
        areCompatible(
          { operation_type: target.operation_type, data: target.data },
          { operation_type: mp.operation_type, data: mp.data }
        )
      )
    : [];

  const hasCompatible = compatible.length > 0;
  const hasAny = myPubs.length > 0;

  const sendMatch = async (myPubId?: string) => {
    if (!user || !target) return;
    setMatching(true);

    // Respuesta optimista
    onOpenChange(false);
    onMatchSent?.();
    haptic("success");
    toast({ title: "¡Match enviado!", description: "Tu solicitud fue registrada." });

    const { error } = await supabase.from("matches").insert({
      publication_id: target.id,
      matched_publication_id: myPubId ?? null,
      user_id: user.id,
    });

    setMatching(false);

    if (error) {
      toast({
        title: "No se pudo enviar el match",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-start justify-between text-left">
          <div>
            <DrawerTitle>Hacer match</DrawerTitle>
            <DrawerDescription className="mt-1">
              {hasCompatible
                ? "Seleccioná una de tus publicaciones compatibles."
                : "Vinculá esta oferta con una publicación tuya o creá una nueva."}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="space-y-3 overflow-y-auto px-4 pb-4 safe-bottom">
          {loadingPubs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Publicaciones compatibles */}
              {hasCompatible && (
                <>
                  <p className="text-sm font-medium text-foreground">Tus publicaciones compatibles</p>
                  {compatible.map((mp) => {
                    const mConfig = getOperationMeta(mp.operation_type);
                    const MIcon = mConfig.icon;
                    const { origen: mO, destino: mD } = getOriginDestination(mp.data, mp.operation_type);
                    return (
                      <button
                        key={mp.id}
                        onClick={() => sendMatch(mp.id)}
                        disabled={matching}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border p-3.5 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 tap-scale"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mConfig.gradient}`}>
                          <MIcon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground">{mConfig.label}</span>
                          {(mO || mD) && (
                            <p className="truncate text-xs text-muted-foreground">{mO} → {mD}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-xs text-muted-foreground">o</span>
                    </div>
                  </div>
                </>
              )}

              {/* Estado vacío: tiene pubs pero ninguna es compatible */}
              {!hasCompatible && hasAny && (
                <div className="rounded-2xl bg-muted/60 p-4 flex items-start gap-3 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>
                    No tenés una publicación compatible con esta oferta. Creá una para poder conectar.
                  </span>
                </div>
              )}

              {/* Estado completamente vacío */}
              {!hasAny && !loadingPubs && (
                <div className="rounded-2xl bg-muted/60 p-4 flex items-start gap-3 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>
                    Todavía no tenés publicaciones activas. Creá una para conectar con esta oferta.
                  </span>
                </div>
              )}

              {/* Botón crear publicación — siempre visible, resaltado si no hay compatibles */}
              <Button
                variant={hasCompatible ? "outline" : "default"}
                className="h-12 w-full rounded-2xl"
                onClick={() => {
                  if (!target) return;
                  onOpenChange(false);
                  const complement = getComplementaryTarget(target.operation_type, target.data);
                  const routeMap: Record<string, string> = {
                    "transportar": "/transportar",
                    "dar-carga": "/dar-carga",
                    "viajar": "/viajar",
                  };
                  const path = routeMap[complement.operation_type] ?? "/seleccionar-operacion";
                  navigate(path, {
                    state: {
                      matchWith: target.id,
                      ...(complement.tipoCarga ? { tipoCarga: complement.tipoCarga } : {}),
                    },
                  });
                }}
              >
                + Crear publicación para hacer match
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MatchDrawer;
