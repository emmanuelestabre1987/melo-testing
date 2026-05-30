import type { Json } from "@/integrations/supabase/types";

export type MatchSide = "demanda" | "oferta";

/** viajar + dar-carga son DEMANDA; transportar es OFERTA. */
export const getMatchSide = (opType: string): MatchSide =>
  opType === "transportar" ? "oferta" : "demanda";

/**
 * Devuelve true si dos publicaciones son complementarias:
 * - deben estar en lados opuestos (demanda ↔ oferta)
 * - "viajar"    ↔ "transportar" con tipoCarga === "personas"
 * - "dar-carga" ↔ "transportar" con tipoCarga === "carga"
 */
export const areCompatible = (
  a: { operation_type: string; data: Json },
  b: { operation_type: string; data: Json }
): boolean => {
  const sideA = getMatchSide(a.operation_type);
  const sideB = getMatchSide(b.operation_type);

  // deben ser lados distintos
  if (sideA === sideB) return false;

  const demanda = sideA === "demanda" ? a : b;
  const oferta  = sideA === "oferta"  ? a : b;

  // leer tipoCarga desde la publicación "transportar" (root del JSONB)
  const rawTipo =
    oferta.data &&
    typeof oferta.data === "object" &&
    !Array.isArray(oferta.data)
      ? (oferta.data as Record<string, Json | undefined>).tipoCarga
      : undefined;

  const tipoCarga = typeof rawTipo === "string" ? rawTipo : undefined;

  if (demanda.operation_type === "viajar") return tipoCarga === "personas";
  if (demanda.operation_type === "dar-carga") return tipoCarga === "carga";
  return false;
};

/**
 * Describe qué tipo de publicación hay que crear para poder matchear
 * con una publicación dada (útil para el botón "Crear publicación").
 */
export const getComplementaryTarget = (
  opType: string,
  data: Json
): { operation_type: string; tipoCarga?: string } => {
  if (opType === "viajar") return { operation_type: "transportar", tipoCarga: "personas" };
  if (opType === "dar-carga") return { operation_type: "transportar", tipoCarga: "carga" };
  if (opType === "transportar") {
    const rawTipo =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, Json | undefined>).tipoCarga
        : undefined;
    if (rawTipo === "personas") return { operation_type: "viajar" };
    if (rawTipo === "carga") return { operation_type: "dar-carga" };
  }
  return { operation_type: "transportar" };
};
