import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionConfig {
  icon: LucideIcon;
  label: string;
  /** CSS color for the revealed background. */
  bg: string;
}

interface SwipeActionProps {
  children: ReactNode;
  /** Swipe right → confirm (revealed on the left edge). */
  right?: ActionConfig & { onAction: () => void };
  /** Swipe left → dismiss (revealed on the right edge). */
  left?: ActionConfig & { onAction: () => void };
  className?: string;
  threshold?: number;
}

const MAX = 160;

/** Horizontal swipe-to-act wrapper (Gmail/Tinder style), pure touch handlers. */
const SwipeAction = ({ children, right, left, className, threshold = 96 }: SwipeActionProps) => {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef(0);
  const axis = useRef<"h" | "v" | null>(null);

  const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));

  const onTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    axis.current = null;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (startX.current === null) return;
    const dxRaw = e.touches[0].clientX - startX.current;
    const dyRaw = e.touches[0].clientY - startY.current;
    if (axis.current === null && (Math.abs(dxRaw) > 8 || Math.abs(dyRaw) > 8)) {
      axis.current = Math.abs(dxRaw) > Math.abs(dyRaw) ? "h" : "v";
    }
    if (axis.current !== "h") return;
    let v = dxRaw;
    if (v > 0 && !right) v = 0;
    if (v < 0 && !left) v = 0;
    setDragging(true);
    setDx(clamp(v));
  };

  const onTouchEnd = () => {
    startX.current = null;
    setDragging(false);
    if (dx >= threshold && right) {
      setDx(window.innerWidth);
      setTimeout(right.onAction, 220);
    } else if (dx <= -threshold && left) {
      setDx(-window.innerWidth);
      setTimeout(left.onAction, 220);
    } else {
      setDx(0);
    }
  };

  const progress = Math.min(1, Math.abs(dx) / threshold);

  return (
    <div className={cn("relative overflow-hidden rounded-3xl", className)}>
      {right && (
        <div
          className="absolute inset-0 flex items-center justify-start pl-6 text-white"
          style={{ background: right.bg, opacity: dx > 0 ? 1 : 0 }}
        >
          <span className="flex items-center gap-2" style={{ transform: `scale(${0.85 + progress * 0.15})` }}>
            <right.icon className="h-5 w-5" />
            <span className="text-sm font-semibold">{right.label}</span>
          </span>
        </div>
      )}
      {left && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-6 text-white"
          style={{ background: left.bg, opacity: dx < 0 ? 1 : 0 }}
        >
          <span className="flex items-center gap-2" style={{ transform: `scale(${0.85 + progress * 0.15})` }}>
            <span className="text-sm font-semibold">{left.label}</span>
            <left.icon className="h-5 w-5" />
          </span>
        </div>
      )}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={cn(!dragging && "transition-transform duration-300 ease-out")}
        style={{ transform: `translateX(${dx}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeAction;
