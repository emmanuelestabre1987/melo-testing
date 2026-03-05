import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  { value: "transportar", label: "Transportar" },
  { value: "dar-carga", label: "Dar carga" },
  { value: "viajar", label: "Viajar" },
];

const TableroFilters = ({ filters, onApply, origins, destinations }: TableroFiltersProps) => {
  const [draft, setDraft] = useState<PublicationFilters>(filters);
  const [open, setOpen] = useState(false);

  const activeCount = [filters.operationType, filters.origen, filters.destino].filter(Boolean).length;

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
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(filters); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Filter className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Filtrar publicaciones</p>

          {/* Tipo de operación */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tipo de operación</label>
            <Select value={draft.operationType || "__all__"} onValueChange={(v) => setDraft((d) => ({ ...d, operationType: v === "__all__" ? "" : v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {OPERATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origen */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Origen</label>
            <Select value={draft.origen || "__all__"} onValueChange={(v) => setDraft((d) => ({ ...d, origen: v === "__all__" ? "" : v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                {origins.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destino */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Destino</label>
            <Select value={draft.destino || "__all__"} onValueChange={(v) => setDraft((d) => ({ ...d, destino: v === "__all__" ? "" : v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                {destinations.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleReset}>
              Restaurar filtros
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TableroFilters;
export { EMPTY_FILTERS };
