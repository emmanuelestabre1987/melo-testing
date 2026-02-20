import { cn } from "@/lib/utils";

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
        "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/5 shadow-card"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      {icon && (
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          selected ? "gradient-primary" : "bg-muted"
        )}>
          {icon}
        </div>
      )}
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="ml-auto">
        <div className={cn(
          "h-5 w-5 rounded-full border-2 transition-all",
          selected ? "border-primary bg-primary" : "border-muted-foreground/30"
        )}>
          {selected && (
            <svg viewBox="0 0 20 20" className="h-full w-full text-primary-foreground">
              <path fill="currentColor" d="M7.629 14.571L3.5 10.443l1.414-1.414 2.715 2.715 6.457-6.457L15.5 6.7z" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default OptionCard;
