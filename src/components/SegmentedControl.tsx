import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** iOS-style segmented control with a sliding active pill. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const pct = 100 / options.length;

  return (
    <div className={cn("relative flex rounded-full bg-muted p-1", className)}>
      <div
        className="absolute inset-y-1 rounded-full bg-card shadow-card transition-transform duration-300 ease-out"
        style={{ width: `calc(${pct}% - 0.25rem)`, transform: `translateX(calc(${index * 100}% + ${index * 0.25}rem))` }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors tap-scale",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
