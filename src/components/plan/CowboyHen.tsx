'use client'

import { motion } from 'framer-motion'

export default function CowboyHen({ className }: { className?: string }) {
  const silhouette = '#5A1A0A'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
      className={className}
    >
      <motion.svg
        width="160"
        height="190"
        viewBox="0 0 160 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor="#D97A3A" />
            <stop offset="60%" stopColor="#C46030" />
            <stop offset="100%" stopColor="#994828" />
          </radialGradient>
        </defs>

        {/* Sunset circle behind rooster */}
        <circle cx="80" cy="58" r="44" fill="url(#sunGlow)" />

        {/* === Rooster silhouette === */}
        <g fill={silhouette}>

          {/* Tail feathers - dramatic sweep to the left */}
          <path d="
            M52 58
            C42 42, 28 32, 20 28
            C16 26, 14 30, 18 36
            C22 42, 28 48, 34 54
            C28 48, 22 38, 16 34
            C12 30, 10 36, 14 42
            C18 48, 26 54, 36 58
            C28 52, 20 44, 14 40
            C10 36, 8 42, 12 48
            C16 54, 28 60, 42 64
            Z
          " />

          {/* Body - plump oval */}
          <ellipse cx="66" cy="64" rx="24" ry="18" />

          {/* Breast curve */}
          <path d="M84 52 C92 58, 94 68, 90 76 C86 80, 80 82, 74 82 L68 78 C74 76, 82 72, 86 64 C88 58, 86 54, 84 52 Z" />

          {/* Neck going up-right */}
          <path d="M82 48 C86 40, 90 34, 92 28 C88 28, 82 34, 78 42 C76 48, 78 52, 82 48 Z" />

          {/* Head */}
          <ellipse cx="94" cy="24" rx="10" ry="9" />

          {/* Comb on top of head */}
          <path d="M86 18 C84 14, 86 10, 88 14 C87 10, 90 8, 91 13 C90 9, 93 8, 93 14 Z" />

          {/* Cowboy hat */}
          {/* Brim */}
          <ellipse cx="94" cy="14" rx="20" ry="4.5" />
          {/* Crown */}
          <path d="M82 14 C82 14, 84 0, 94 0 C104 0, 106 14, 106 14 Z" />

          {/* Beak - pointing right */}
          <path d="M103 22 L114 21 L103 26 Z" />

          {/* Wheat straw in beak - angled up-right */}
          <line x1="108" y1="22" x2="130" y2="14" stroke={silhouette} strokeWidth="1.8" strokeLinecap="round" />
          {/* Wheat head bits */}
          <line x1="126" y1="15" x2="130" y2="10" stroke={silhouette} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="127" y1="14.5" x2="132" y2="13" stroke={silhouette} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="125" y1="15.5" x2="128" y2="18" stroke={silhouette} strokeWidth="1.2" strokeLinecap="round" />

          {/* Wattle under beak */}
          <path d="M100 28 C102 30, 102 34, 100 35 C98 34, 98 30, 100 28 Z" />

          {/* Legs → down to perch */}
          <rect x="62" y="80" width="5" height="20" rx="2" />
          <rect x="72" y="80" width="5" height="18" rx="2" />

          {/* Weathervane pole */}
          <rect x="68" y="98" width="4" height="44" />

          {/* Weathervane horizontal bar */}
          <rect x="32" y="138" width="76" height="4" rx="1" />

          {/* Decorative circle at center of cross */}
          <circle cx="70" cy="140" r="5" />

          {/* Left arrow */}
          <polygon points="38,130 24,140 38,150" />

          {/* Right arrow */}
          <polygon points="102,130 116,140 102,150" />
        </g>

        {/* Eye - light dot */}
        <circle cx="97" cy="22" r="2.5" fill="#D4A87A" />
        <circle cx="97.5" cy="21.5" r="1" fill={silhouette} />

        {/* Hat band detail */}
        <line x1="84" y1="10" x2="104" y2="10" stroke="#3A0800" strokeWidth="1.5" opacity="0.5" />
      </motion.svg>
    </motion.div>
  )
}
