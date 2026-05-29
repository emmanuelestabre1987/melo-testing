import { flushSync } from "react-dom";

type Navigate = (to: string) => void;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Navigate with a native View Transition (crossfade / shared-element morph)
 * when the browser supports it, falling back to a plain navigation otherwise.
 * `flushSync` forces the route to render inside the transition so the browser
 * captures the destination, not the spinner.
 */
export const transitionNavigate = (navigate: Navigate, to: string) => {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };

  if (!doc.startViewTransition || prefersReducedMotion()) {
    navigate(to);
    return;
  }

  doc.startViewTransition(() => {
    flushSync(() => navigate(to));
  });
};

/**
 * Warm a lazily-loaded route chunk so the subsequent transition reveals real
 * content instead of the Suspense fallback. Call on pointerdown.
 */
export const prefetch = (loader: () => Promise<unknown>) => {
  loader().catch(() => {});
};
