/** Inline SVG logo — no background, blends with any surface */
const MeloLogo = ({ className = "h-12" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 220"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sun circle */}
    <circle cx="100" cy="60" r="35" fill="#C8A264" opacity="0.8" />

    {/* Cross on peak */}
    <line x1="80" y1="28" x2="80" y2="48" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <line x1="72" y1="36" x2="88" y2="36" stroke="white" strokeWidth="3" strokeLinecap="round" />

    {/* WiFi arcs from cross */}
    <path d="M73 30 A8 8 0 0 0 87 30" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
    <path d="M69 27 A12 12 0 0 0 91 27" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />

    {/* Left mountain */}
    <path d="M30 140 L80 40 L130 140 Z" fill="#1B4332" />
    {/* Right mountain */}
    <path d="M80 140 L130 55 L180 140 Z" fill="#2D5A27" />

    {/* Circuit traces on mountains */}
    <line x1="55" y1="100" x2="75" y2="70" stroke="#2D5A27" strokeWidth="0.8" opacity="0.4" />
    <line x1="75" y1="70" x2="85" y2="85" stroke="#2D5A27" strokeWidth="0.8" opacity="0.4" />
    <line x1="130" y1="90" x2="150" y2="110" stroke="#1B4332" strokeWidth="0.8" opacity="0.4" />
    <circle cx="75" cy="70" r="1.5" fill="#2D5A27" opacity="0.5" />
    <circle cx="130" cy="90" r="1.5" fill="#1B4332" opacity="0.5" />

    {/* River waves */}
    <path
      d="M20 142 Q45 130 70 140 Q95 150 120 138 Q145 126 170 140 Q185 148 195 142"
      fill="none"
      stroke="#0077B6"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M25 152 Q50 140 75 150 Q100 160 125 148 Q150 136 175 150 Q188 157 198 152"
      fill="none"
      stroke="#0096E0"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Circuit nodes at river */}
    <rect x="28" y="155" width="3" height="3" fill="#0B2545" opacity="0.6" />
    <line x1="31" y1="156" x2="42" y2="156" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="42" cy="156" r="1.5" fill="#0B2545" opacity="0.5" />
    <line x1="42" y1="156" x2="50" y2="160" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="50" cy="160" r="1.5" fill="#0B2545" opacity="0.5" />

    <rect x="165" y="155" width="3" height="3" fill="#0B2545" opacity="0.6" />
    <line x1="165" y1="156" x2="155" y2="156" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="155" cy="156" r="1.5" fill="#0B2545" opacity="0.5" />
    <line x1="155" y1="156" x2="148" y2="160" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="148" cy="160" r="1.5" fill="#0B2545" opacity="0.5" />

    {/* MELO text */}
    <text
      x="100"
      y="195"
      textAnchor="middle"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="800"
      fontSize="36"
      fill="#0B2545"
      letterSpacing="2"
    >
      MELO
    </text>
  </svg>
);

export default MeloLogo;
