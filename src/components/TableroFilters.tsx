import { useState } from "react";
import { SlidersHorizontal, Truck, Package, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface PublicationFilters {
  operationType: string;
  origen: string;
  destino: string;
}

const EMPTY_FILTERS: PublicationFilters = { operationType: "", origen: "", destino: "" };

interface TableroFiltersProps {
  filters: PublicationFilters;
  onApply: (filters: PublicationFilters) => void;
  origins: string[];
  destinations: string[];
}

const OPERATION_OPTIONS = [
  { value: "transportar", label: "Transportar", icon: Truck },
  { value: "dar-carga", label: "Dar carga", icon: Package },
  { value: "viajar", label: "Viajar", icon: Users },
];

const TableroFilters = ({ filters, onApply, origins, destinations }: TableroFiltersProps) => {
  const [draft, setDraft] = useState<PublicationFilters>(filters);
  const [open, setOpen] = useState(false);

  const activeCount = [filters.operationType, filters.origen, filters.destino].filter(Boolean).length;

  const summary = (() => {
    if (activeCount === 0) return "Todas las publicaciones";
    const parts: string[] = [];
    const op = OPERATION_OPTIONS.find((o) => o.value === filters.operationType);
    if (op) parts.push(op.label);
    if (filters.origen || filters.destino) {
      parts.push(`${filters.origen || "—"} → ${filters.destino || "—"}`);
    }
    return parts.join(" · ");
  })();

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(filters); }}>
      <DrawerTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-left shadow-card tap-scale"
          aria-label="Filtrar publicaciones"
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 truncate text-sm font-medium text-foreground">{summary}</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between text-left">
          <DrawerTitle>Filtrar</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="space-y-6 overflow-y-auto px-4 pb-2">
          {/* Tipo de operación — chips */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">Tipo de operación</p>
            <div className="grid grid-cols-3 gap-2">
              {OPERATION_OPTIONS.map((o) => {
                const selected = draft.operationType === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() =>
                      setDraft((d) => ({ ...d, operationType: selected ? "" : o.value }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all tap-scale",
                      selected ? "border-primary bg-accent" : "border-border bg-card"
                    )}
                  >
                    <o.icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-xs font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Origen */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Origen</label>
            <Select
              value={draft.origen || "__all__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, origen: v === "__all__" ? "" : v }))}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los orígenes</SelectItem>
                {origins.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Destino</label>
            <Select
              value={draft.destino || "__all__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, destino: v === "__all__" ? "" : v }))}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los destinos</SelectItem>
                {destinations.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border p-4 safe-bottom">
          <Button variant="ghost" className="font-semibold underline-offset-4 hover:underline" onClick={handleReset}>
            Limpiar
          </Button>
          <Button className="h-12 flex-1 max-w-[200px] rounded-xl font-semibold" onClick={handleApply}>
            Mostrar resultados
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TableroFilters;
export { EMPTY_FILTERS };
