export default function StudyBuddy({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Study buddy cartoon character"
    >
      {/* Ground shadow */}
      <ellipse cx="110" cy="294" rx="52" ry="8" fill="#bfdbfe" opacity="0.5" />

      {/* Legs */}
      <rect x="87" y="214" width="18" height="68" rx="9" fill="#c2713b" />
      <rect x="115" y="214" width="18" height="68" rx="9" fill="#c2713b" />

      {/* Shoes */}
      <ellipse cx="96" cy="281" rx="15" ry="9" fill="#1e3a8a" />
      <ellipse cx="124" cy="281" rx="15" ry="9" fill="#1e3a8a" />

      {/* Dress/Skirt bottom — widens downward */}
      <path d="M68 186 Q64 215 66 234 L154 234 Q156 215 152 186 Z" fill="#1d4ed8" />

      {/* Dress/Bodice */}
      <rect x="74" y="135" width="72" height="58" rx="14" fill="#2563eb" />

      {/* Stars on dress */}
      <polygon
        points="95,160 96.8,154.5 98.6,160 104.5,160 99.9,163.2 101.7,168.7 96.8,165.5 91.9,168.7 93.7,163.2 89.1,160"
        fill="#fbbf24"
      />
      <polygon
        points="122,172 123.4,167.5 124.8,172 129.5,172 125.9,174.6 127.3,179.1 123.4,176.5 119.5,179.1 120.9,174.6 117.3,172"
        fill="#fde68a"
      />
      <polygon
        points="141,152 142,149 143,152 146,152 143.9,153.6 144.7,156.5 142,154.9 139.3,156.5 140.1,153.6 138,152"
        fill="#fbbf24"
      />

      {/* Left arm — raised and waving */}
      <path d="M74 152 Q50 132 42 108" stroke="#c2713b" strokeWidth="16" strokeLinecap="round" fill="none" />
      <circle cx="41" cy="104" r="11" fill="#c2713b" />

      {/* Right arm — holding a book */}
      <path d="M146 155 Q172 162 174 182" stroke="#c2713b" strokeWidth="16" strokeLinecap="round" fill="none" />

      {/* Book */}
      <rect x="168" y="176" width="38" height="28" rx="5" fill="#fbbf24" />
      <rect x="173" y="180" width="28" height="20" rx="3" fill="white" />
      <line x1="177" y1="185" x2="196" y2="185" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="177" y1="190" x2="196" y2="190" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="177" y1="195" x2="191" y2="195" stroke="#2563eb" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="102" y="124" width="16" height="21" rx="8" fill="#c2713b" />

      {/* Head */}
      <circle cx="110" cy="90" r="48" fill="#c2713b" />

      {/* Poofy afro hair — layered circles */}
      <circle cx="110" cy="52" r="38" fill="#1c1917" />
      <circle cx="80" cy="68" r="24" fill="#1c1917" />
      <circle cx="140" cy="68" r="24" fill="#1c1917" />
      <circle cx="68" cy="92" r="16" fill="#1c1917" />
      <circle cx="152" cy="92" r="16" fill="#1c1917" />
      <circle cx="85" cy="37" r="19" fill="#1c1917" />
      <circle cx="135" cy="37" r="19" fill="#1c1917" />

      {/* Headband */}
      <rect x="74" y="59" width="72" height="12" rx="6" fill="#fbbf24" />

      {/* Star on headband */}
      <polygon
        points="110,56 111.5,60.5 116.5,60.5 112.6,63.2 114.1,67.7 110,65 105.9,67.7 107.4,63.2 103.5,60.5 108.5,60.5"
        fill="#f97316"
      />

      {/* Left eye */}
      <ellipse cx="96" cy="96" rx="10" ry="11" fill="white" />
      <circle cx="99" cy="98" r="7" fill="#1c1917" />
      <circle cx="101.5" cy="95.5" r="2.5" fill="white" />

      {/* Right eye */}
      <ellipse cx="124" cy="96" rx="10" ry="11" fill="white" />
      <circle cx="127" cy="98" r="7" fill="#1c1917" />
      <circle cx="129.5" cy="95.5" r="2.5" fill="white" />

      {/* Eyebrows */}
      <path d="M88 84 Q96 80 104 84" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M116 84 Q124 80 132 84" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M97 110 Q110 122 123 110" stroke="#7c3f1a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Rosy cheeks */}
      <circle cx="82" cy="106" r="9" fill="#fb7185" opacity="0.3" />
      <circle cx="138" cy="106" r="9" fill="#fb7185" opacity="0.3" />

      {/* Floating sparkle dots */}
      <circle cx="22" cy="118" r="5" fill="#fbbf24" opacity="0.7" />
      <circle cx="15" cy="104" r="3" fill="#fbbf24" opacity="0.5" />
      <circle cx="30" cy="93" r="2" fill="#bfdbfe" opacity="0.9" />
      <circle cx="194" cy="76" r="4" fill="#fbbf24" opacity="0.6" />
      <circle cx="202" cy="90" r="2.5" fill="#bfdbfe" opacity="0.7" />
      <circle cx="188" cy="106" r="2" fill="#fde68a" opacity="0.8" />
    </svg>
  );
}
