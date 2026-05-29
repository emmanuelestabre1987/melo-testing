import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  /** Distance (px) the user must pull before a refresh triggers. */
  threshold?: number;
}

const MAX_PULL = 120;

/**
 * Native-feeling pull-to-refresh. Renders its own scroll container so the pull
 * gesture only kicks in when the list is already scrolled to the top.
 */
const PullToRefresh = ({ onRefresh, children, className, threshold = 70 }: PullToRefreshProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (refreshing) return;
    const el = scrollRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = null;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      setPull(0);
      setDragging(false);
      return;
    }
    // Rubber-band resistance so the pull feels weighty near the limit.
    const damped = Math.min(MAX_PULL, delta * 0.5);
    setDragging(true);
    setPull(damped);
  };

  const handleTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    setDragging(false);
    if (pull >= threshold) {
      setRefreshing(true);
      setPull(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const ready = pull >= threshold;
  const indicatorOpacity = Math.min(1, pull / threshold);

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("relative h-full overflow-y-auto overscroll-y-contain", className)}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-end justify-center"
        style={{ height: refreshing ? threshold : pull, opacity: refreshing ? 1 : indicatorOpacity }}
      >
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card-hover">
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                ready && "rotate-180 text-primary"
              )}
            />
          )}
        </div>
      </div>

      <div
        className={cn(!dragging && "transition-transform duration-300 ease-out")}
        style={{ transform: `translateY(${refreshing ? threshold : pull}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
