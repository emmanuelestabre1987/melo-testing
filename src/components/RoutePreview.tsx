import { cn } from "@/lib/utils";

interface RoutePreviewProps {
  origen?: string;
  destino?: string;
  className?: string;
}

/**
 * On-brand schematic route: two pin dots joined by a dashed arc (echoes the
 * logo's route-"M"). Purely visual — lightweight enough for long lists, unlike
 * a real map per card.
 */
const RoutePreview = ({ origen, destino, className }: RoutePreviewProps) => (
  <div className={cn("w-full", className)}>
    <svg
      viewBox="0 0 100 16"
      preserveAspectRatio="none"
      className="h-4 w-full text-foreground"
      aria-hidden="true"
    >
      <path
        d="M5 8 Q50 -2 95 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 2.5"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="5" cy="8" r="3" fill="currentColor" />
      <circle cx="95" cy="8" r="3" fill="currentColor" />
    </svg>
    <div className="mt-1 flex items-center justify-between gap-2 text-xs">
      <span className="truncate font-medium text-foreground">{origen || "—"}</span>
      <span className="truncate text-right font-medium text-foreground">{destino || "—"}</span>
    </div>
  </div>
);

export default RoutePreview;
