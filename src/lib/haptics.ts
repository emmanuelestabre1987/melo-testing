/**
 * Light haptic feedback for key actions. No-op where the Vibration API is
 * unavailable (most desktop browsers, iOS Safari).
 */
type Pattern = "light" | "success" | "warning";

const patterns: Record<Pattern, number | number[]> = {
  light: 10,
  success: [12, 40, 18],
  warning: [20, 50, 20],
};

export const haptic = (pattern: Pattern = "light") => {
  try {
    navigator.vibrate?.(patterns[pattern]);
  } catch {
    /* ignored */
  }
};
