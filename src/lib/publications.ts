import { Truck, Package, Users, type LucideIcon } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

export type OperationType = "transportar" | "dar-carga" | "viajar";

export interface OperationMeta {
  label: string;
  icon: LucideIcon;
  gradient: string;
  tint: string;
}

/** Visual config shared across the board, detail and matches screens. */
export const operationConfig: Record<string, OperationMeta> = {
  transportar: { label: "Transportar", icon: Truck, gradient: "gradient-primary", tint: "bg-accent text-accent-foreground" },
  "dar-carga": { label: "Dar carga", icon: Package, gradient: "gradient-warm", tint: "bg-secondary text-secondary-foreground" },
  viajar: { label: "Viajar", icon: Users, gradient: "gradient-cta", tint: "bg-muted text-foreground" },
};

export const getOperationMeta = (opType: string): OperationMeta =>
  operationConfig[opType] ?? operationConfig.viajar;

/** Format the nested `frecuencia` object into a human-readable string. */
export const formatFrecuencia = (data: Json): string => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";
  const f = (data as Record<string, Json | undefined>).frecuencia;
  if (!f || typeof f !== "object" || Array.isArray(f)) return "";
  const o = f as Record<string, Json | undefined>;
  if (o.tipo === "fecha-especifica" && typeof o.fecha === "string")
    return new Date(o.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  if (o.tipo === "dias-semana" && Array.isArray(o.diasSemana))
    return (o.diasSemana as string[]).join(", ");
  if (o.tipo === "rango-dias" && o.rangoDesde && o.rangoHasta)
    return `${o.rangoDesde} a ${o.rangoHasta}`;
  return "";
};

/** Safely read a string/number field out of the flexible JSONB `data` blob. */
export const getField = (data: Json, key: string): string => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const val = (data as Record<string, Json | undefined>)[key];
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
  }
  return "";
};

/**
 * Origin/destination live under `data.ruta` for `transportar` publications
 * and directly under `data` for the rest.
 */
export const getOriginDestination = (data: Json, opType: string) => {
  if (opType === "transportar") {
    const ruta =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, Json | undefined>).ruta
        : null;
    return {
      origen: ruta ? getField(ruta as Json, "origen") : "",
      destino: ruta ? getField(ruta as Json, "destino") : "",
    };
  }
  return { origen: getField(data, "origen"), destino: getField(data, "destino") };
};

export interface LatLon {
  lat: number;
  lon: number;
}

const toLatLon = (v: Json | undefined): LatLon | undefined => {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, Json | undefined>;
    if (typeof o.lat === "number" && typeof o.lon === "number") {
      return { lat: o.lat, lon: o.lon };
    }
  }
  return undefined;
};

/**
 * Origin/destination coordinates. They live under `data.ruta` for `transportar`
 * publications and directly under `data` for the rest (see the wizards).
 */
export const getCoords = (data: Json, opType: string): { origin?: LatLon; destination?: LatLon } => {
  let obj = data;
  if (opType === "transportar" && data && typeof data === "object" && !Array.isArray(data)) {
    obj = (data as Record<string, Json | undefined>).ruta ?? data;
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
  const o = obj as Record<string, Json | undefined>;
  return { origin: toLatLon(o.origenCoords), destination: toLatLon(o.destinoCoords) };
};

export const fieldLabels: Record<string, string> = {
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

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

/** "hace 5 min", "hace 2 h", "ayer"… for an Airbnb-style relative timestamp. */
export const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  return formatDate(iso);
};
