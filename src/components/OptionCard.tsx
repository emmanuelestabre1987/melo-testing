import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const OptionCard = ({ label, description, selected, onClick, icon }: OptionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
        selected
          ? "border-primary bg-accent shadow-card"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      {icon && (
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected ? "gradient-primary" : "bg-muted"
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
        selected ? "border-primary bg-primary" : "border-muted-foreground/30"
      )}>
        {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
      </div>
    </button>
  );
};

export default OptionCard;
