/**
 * Melo Envíos brand logo.
 *
 * Reproduces the rounded-square mark with the white "M" route (two pin dots)
 * plus the "MELO / ENVIOS" wordmark. Colours are theme-adaptive: the mark fills
 * with `--foreground` and the route with `--background`, so it inverts cleanly
 * between light and dark mode.
 *
 * Variants:
 *  - "mark":       just the icon square.
 *  - "horizontal": icon + "MELO" / "ENVIOS" beside it (default — headers).
 *  - "full":       stacked lockup (icon over wordmark — splash / login).
 */
type Variant = "full" | "horizontal" | "mark";

const FG = "hsl(var(--foreground))";
const BG = "hsl(var(--background))";

/** The rounded-square icon with the route-M. Drawn in a 100×100 box. */
const Mark = ({ x = 0, y = 0 }: { x?: number; y?: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="6" y="6" width="88" height="88" rx="24" fill={FG} />
    <path
      d="M30 70 L30 47 C30 35 50 35 50 55 C50 35 70 35 70 47 L70 70"
      fill="none"
      stroke={BG}
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="30" cy="70" r="5.6" fill={BG} />
    <circle cx="70" cy="70" r="5.6" fill={BG} />
  </g>
);

const MeloLogo = ({
  className = "h-10",
  variant = "horizontal",
}: {
  className?: string;
  variant?: Variant;
}) => {
  if (variant === "mark") {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Melo Envíos">
        <Mark />
      </svg>
    );
  }

  if (variant === "full") {
    return (
      <svg viewBox="0 0 200 252" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Melo Envíos">
        <Mark x={50} y={4} />
        <text
          x="100"
          y="172"
          textAnchor="middle"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="800"
          fontSize="54"
          letterSpacing="3"
          fill={FG}
        >
          MELO
        </text>
        <g stroke={FG} strokeWidth="2.5" strokeLinecap="round">
          <line x1="44" y1="206" x2="66" y2="206" />
          <line x1="134" y1="206" x2="156" y2="206" />
        </g>
        <text
          x="100"
          y="214"
          textAnchor="middle"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          fontSize="24"
          letterSpacing="9"
          fill={FG}
        >
          ENVIOS
        </text>
      </svg>
    );
  }

  // horizontal
  return (
    <svg viewBox="0 0 372 116" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Melo Envíos">
      <Mark x={6} y={8} />
      <text
        x="122"
        y="62"
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="50"
        letterSpacing="2"
        fill={FG}
      >
        MELO
      </text>
      <text
        x="124"
        y="92"
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight="600"
        fontSize="19"
        letterSpacing="7"
        fill="hsl(var(--muted-foreground))"
      >
        ENVIOS
      </text>
    </svg>
  );
};

export default MeloLogo;
