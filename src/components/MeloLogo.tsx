/** Inline SVG logo — clean Andiamo-inspired style */
const MeloLogo = ({ className = "h-12" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 230"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sun circle */}
    <circle cx="100" cy="42" r="32" fill="hsl(24, 95%, 53%)" opacity="0.15" />

    {/* Cross on peak */}
    <line x1="80" y1="26" x2="80" y2="56" stroke="hsl(24, 95%, 53%)" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="71" y1="38" x2="89" y2="38" stroke="hsl(24, 95%, 53%)" strokeWidth="3.5" strokeLinecap="round" />

    {/* WiFi arcs */}
    <path d="M72 28 A10 10 0 0 0 88 28" fill="none" stroke="hsl(24, 95%, 53%)" strokeWidth="1.5" opacity="0.6" />
    <path d="M67 24 A15 15 0 0 0 93 24" fill="none" stroke="hsl(24, 95%, 53%)" strokeWidth="1.2" opacity="0.4" />
    <path d="M63 20 A19 19 0 0 0 97 20" fill="none" stroke="hsl(24, 95%, 53%)" strokeWidth="0.9" opacity="0.25" />

    {/* Left mountain */}
    <path d="M25 148 L80 42 L135 148 Z" fill="hsl(220, 14%, 20%)" />
    {/* Right mountain */}
    <path d="M75 148 L130 55 L185 148 Z" fill="hsl(220, 14%, 30%)" />

    {/* River waves */}
    <path
      d="M15 150 Q40 138 65 148 Q90 158 115 146 Q140 134 165 148 Q180 156 195 148"
      fill="none"
      stroke="hsl(24, 95%, 53%)"
      strokeWidth="4.5"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M20 160 Q45 148 70 158 Q95 168 120 156 Q145 144 170 158 Q183 164 198 158"
      fill="none"
      stroke="hsl(24, 80%, 60%)"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.4"
    />

    {/* MELO text */}
    <text
      x="100"
      y="202"
      textAnchor="middle"
      fontFamily="'Inter', sans-serif"
      fontWeight="800"
      fontSize="36"
      fill="hsl(220, 14%, 10%)"
      letterSpacing="2"
    >
      MELO
    </text>
  </svg>
);

export default MeloLogo;
