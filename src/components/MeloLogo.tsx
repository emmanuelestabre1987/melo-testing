/** Inline SVG logo — no background, blends with any surface */
const MeloLogo = ({ className = "h-12" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 230"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sun circle — positioned higher for cross contrast */}
    <circle cx="100" cy="42" r="32" fill="#C8A264" opacity="0.75" />

    {/* Cross on peak — clearly visible against sun */}
    <line x1="80" y1="30" x2="80" y2="52" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="71" y1="38" x2="89" y2="38" stroke="white" strokeWidth="3.5" strokeLinecap="round" />

    {/* WiFi arcs from cross — digital connectivity */}
    <path d="M72 28 A10 10 0 0 0 88 28" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />
    <path d="M67 24 A15 15 0 0 0 93 24" fill="none" stroke="white" strokeWidth="1.2" opacity="0.55" />
    <path d="M63 20 A19 19 0 0 0 97 20" fill="none" stroke="white" strokeWidth="0.9" opacity="0.35" />

    {/* Left mountain */}
    <path d="M25 148 L80 42 L135 148 Z" fill="#1B4332" />
    {/* Right mountain */}
    <path d="M75 148 L130 55 L185 148 Z" fill="#2D5A27" />

    {/* Circuit traces on left mountain */}
    <line x1="52" y1="100" x2="68" y2="72" stroke="#3A7D44" strokeWidth="0.8" opacity="0.5" />
    <line x1="68" y1="72" x2="78" y2="88" stroke="#3A7D44" strokeWidth="0.8" opacity="0.5" />
    <line x1="78" y1="88" x2="60" y2="115" stroke="#3A7D44" strokeWidth="0.8" opacity="0.5" />
    <circle cx="68" cy="72" r="2" fill="#3A7D44" opacity="0.6" />
    <circle cx="78" cy="88" r="1.5" fill="#3A7D44" opacity="0.5" />
    <circle cx="52" cy="100" r="1.5" fill="#3A7D44" opacity="0.5" />

    {/* Circuit traces on right mountain */}
    <line x1="135" y1="90" x2="148" y2="108" stroke="#1B4332" strokeWidth="0.8" opacity="0.5" />
    <line x1="148" y1="108" x2="140" y2="125" stroke="#1B4332" strokeWidth="0.8" opacity="0.5" />
    <line x1="140" y1="125" x2="155" y2="135" stroke="#1B4332" strokeWidth="0.8" opacity="0.5" />
    <circle cx="135" cy="90" r="2" fill="#1B4332" opacity="0.5" />
    <circle cx="148" cy="108" r="1.5" fill="#1B4332" opacity="0.5" />
    <circle cx="155" cy="135" r="1.5" fill="#1B4332" opacity="0.5" />

    {/* River waves */}
    <path
      d="M15 150 Q40 138 65 148 Q90 158 115 146 Q140 134 165 148 Q180 156 195 148"
      fill="none"
      stroke="#0077B6"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M20 160 Q45 148 70 158 Q95 168 120 156 Q145 144 170 158 Q183 164 198 158"
      fill="none"
      stroke="#0096E0"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Circuit nodes at river — digital data flow */}
    <rect x="22" y="164" width="3.5" height="3.5" rx="0.5" fill="#0B2545" opacity="0.6" />
    <line x1="25.5" y1="166" x2="38" y2="166" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="38" cy="166" r="1.8" fill="#0B2545" opacity="0.5" />
    <line x1="38" y1="166" x2="48" y2="170" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="48" cy="170" r="1.5" fill="#0B2545" opacity="0.45" />

    <rect x="170" y="164" width="3.5" height="3.5" rx="0.5" fill="#0B2545" opacity="0.6" />
    <line x1="170" y1="166" x2="158" y2="166" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="158" cy="166" r="1.8" fill="#0B2545" opacity="0.5" />
    <line x1="158" y1="166" x2="150" y2="170" stroke="#0B2545" strokeWidth="0.8" opacity="0.5" />
    <circle cx="150" cy="170" r="1.5" fill="#0B2545" opacity="0.45" />

    {/* Small binary / pixel dots — subtle digital accent */}
    <circle cx="42" cy="130" r="1" fill="#0077B6" opacity="0.25" />
    <circle cx="46" cy="133" r="0.8" fill="#0077B6" opacity="0.2" />
    <circle cx="160" cy="128" r="1" fill="#0077B6" opacity="0.25" />
    <circle cx="164" cy="132" r="0.8" fill="#0077B6" opacity="0.2" />

    {/* MELO text */}
    <text
      x="100"
      y="202"
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
