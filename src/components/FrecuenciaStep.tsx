import { useState } from "react";
import OptionCard from "@/components/OptionCard";
import { Calendar as CalendarIcon, CalendarDays, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export type FrecuenciaData = {
  tipo: "fecha-especifica" | "dias-semana" | "rango-dias" | "";
  fecha?: Date;
  diasSemana?: string[];
  rangoDesde?: string;
  rangoHasta?: string;
};

interface FrecuenciaStepProps {
  value: FrecuenciaData;
  onChange: (value: FrecuenciaData) => void;
}

const FrecuenciaStep = ({ value, onChange }: FrecuenciaStepProps) => {
  const [openCalendar, setOpenCalendar] = useState(false);

  const toggleDia = (dia: string) => {
    const current = value.diasSemana || [];
    const next = current.includes(dia)
      ? current.filter((d) => d !== dia)
      : [...current, dia];
    onChange({ ...value, diasSemana: next });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Frecuencia de operación</h3>

      <OptionCard
        label="Fecha específica"
        description="Seleccioná una fecha puntual"
        selected={value.tipo === "fecha-especifica"}
        onClick={() => onChange({ ...value, tipo: "fecha-especifica" })}
        icon={<CalendarIcon className="h-5 w-5 text-primary-foreground" />}
      />

      {value.tipo === "fecha-especifica" && (
        <div className="pl-4">
          <div className="flex gap-2 mb-2">
            {[
              { label: "Hoy", date: new Date() },
              { label: "Mañana", date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })() },
            ].map((chip) => {
              const isSel = value.fecha && value.fecha.toDateString() === chip.date.toDateString();
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => onChange({ ...value, fecha: chip.date })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    isSel
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value.fecha && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.fecha
                  ? format(value.fecha, "PPP", { locale: es })
                  : "Elegí una fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.fecha}
                onSelect={(date) => {
                  onChange({ ...value, fecha: date || undefined });
                  setOpenCalendar(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <OptionCard
        label="Días de la semana"
        description="Elegí uno o más días"
        selected={value.tipo === "dias-semana"}
        onClick={() => onChange({ ...value, tipo: "dias-semana" })}
        icon={<CalendarDays className="h-5 w-5 text-primary-foreground" />}
      />

      {value.tipo === "dias-semana" && (
        <div className="pl-4 flex flex-wrap gap-2">
          {DIAS.map((dia) => {
            const selected = (value.diasSemana || []).includes(dia);
            return (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(dia)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                )}
              >
                {dia}
              </button>
            );
          })}
        </div>
      )}

      <OptionCard
        label="Rango de días"
        description="Ej: Lunes a Miércoles"
        selected={value.tipo === "rango-dias"}
        onClick={() => onChange({ ...value, tipo: "rango-dias" })}
        icon={<ArrowRightLeft className="h-5 w-5 text-primary-foreground" />}
      />

      {value.tipo === "rango-dias" && (
        <div className="pl-4 flex items-center gap-2">
          <Select
            value={value.rangoDesde || ""}
            onValueChange={(v) => onChange({ ...value, rangoDesde: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Desde" />
            </SelectTrigger>
            <SelectContent>
              {DIAS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground shrink-0">a</span>
          <Select
            value={value.rangoHasta || ""}
            onValueChange={(v) => onChange({ ...value, rangoHasta: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Hasta" />
            </SelectTrigger>
            <SelectContent>
              {DIAS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export const isFrecuenciaValid = (f: FrecuenciaData): boolean => {
  if (!f.tipo) return false;
  if (f.tipo === "fecha-especifica") return !!f.fecha;
  if (f.tipo === "dias-semana") return (f.diasSemana || []).length > 0;
  if (f.tipo === "rango-dias") return !!f.rangoDesde && !!f.rangoHasta;
  return false;
};

export default FrecuenciaStep;
