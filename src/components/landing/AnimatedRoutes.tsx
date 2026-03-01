'use client'

import { motion } from 'framer-motion'

// Desert landscape with rolling hay bales
export default function AnimatedRoutes() {
  return (
    <div className="absolute inset-0 z-0">
      <svg
        viewBox="0 0 1500 900"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Desert sky gradient */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0a05" />
            <stop offset="40%" stopColor="#2d1508" />
            <stop offset="70%" stopColor="#3d1c0a" />
            <stop offset="100%" stopColor="#4a2010" />
          </linearGradient>
          <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5c3a1e" />
            <stop offset="100%" stopColor="#3d2510" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a1a0e" />
            <stop offset="50%" stopColor="#3d2815" />
            <stop offset="100%" stopColor="#2a1a0e" />
          </linearGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8a040" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#c47020" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8b4513" stopOpacity="0" />
          </radialGradient>
          <filter id="dustGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1500" height="900" fill="url(#skyGrad)" />

        {/* Setting sun glow */}
        <circle cx="750" cy="380" r="200" fill="url(#sunGrad)" />
        <motion.circle
          cx="750"
          cy="380"
          r="120"
          fill="#e8a040"
          opacity="0.06"
          animate={{ r: [120, 140, 120], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Distant mesa/buttes silhouettes */}
        <path d="M0 500 L100 420 L150 425 L200 380 L280 385 L320 400 L350 350 L420 355 L460 400 L500 500" fill="#2a1508" />
        <path d="M450 500 L550 430 L600 435 L680 390 L720 395 L760 440 L800 500" fill="#251308" />
        <path d="M750 500 L850 450 L900 420 L950 425 L1000 380 L1050 385 L1100 410 L1150 500" fill="#2a1508" />
        <path d="M1100 500 L1200 440 L1250 420 L1300 425 L1380 450 L1500 500" fill="#201005" />

        {/* Desert ground */}
        <path d="M0 500 Q375 480 750 500 Q1125 520 1500 500 L1500 900 L0 900Z" fill="url(#sandGrad)" />

        {/* Desert road (perspective) */}
        <path d="M680 500 L740 900 L760 900 L820 500Z" fill="url(#roadGrad)" opacity="0.5" />
        {/* Road dashes */}
        {[520, 560, 610, 670, 740, 820].map((y, i) => {
          const width = 2 + (y - 500) * 0.01
          const cx = 750
          return (
            <motion.rect
              key={`dash-${i}`}
              x={cx - width / 2}
              y={y}
              width={width}
              height={8 + i * 2}
              fill="#8b7355"
              opacity={0.3}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          )
        })}

        {/* Cacti silhouettes */}
        {/* Cactus 1 - left */}
        <g opacity="0.6">
          <rect x="200" y="470" width="8" height="40" rx="3" fill="#1a0a02" />
          <rect x="196" y="480" width="6" height="20" rx="3" fill="#1a0a02" transform="rotate(-20, 196, 480)" />
          <rect x="206" y="475" width="5" height="18" rx="2" fill="#1a0a02" transform="rotate(25, 206, 475)" />
        </g>
        {/* Cactus 2 - right */}
        <g opacity="0.5">
          <rect x="1200" y="480" width="7" height="35" rx="3" fill="#1a0a02" />
          <rect x="1196" y="488" width="5" height="16" rx="2" fill="#1a0a02" transform="rotate(-15, 1196, 488)" />
          <rect x="1205" y="485" width="5" height="20" rx="2" fill="#1a0a02" transform="rotate(20, 1205, 485)" />
        </g>
        {/* Cactus 3 - far left */}
        <g opacity="0.35">
          <rect x="80" y="485" width="5" height="25" rx="2" fill="#1a0a02" />
          <rect x="78" y="490" width="4" height="12" rx="2" fill="#1a0a02" transform="rotate(-25, 78, 490)" />
        </g>

        {/* Rolling Hay Bales */}
        {/* Hay bale 1 - rolling left to right across foreground */}
        <motion.g
          animate={{ x: [-200, 1700], rotate: [0, 1080] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="0" cy="650" r="28" fill="#8B7340" stroke="#6B5530" strokeWidth="2" />
          <circle cx="0" cy="650" r="28" fill="none" stroke="#A08850" strokeWidth="1" opacity="0.5" />
          {/* Hay texture lines */}
          <line x1="-20" y1="640" x2="20" y2="660" stroke="#6B5530" strokeWidth="1" opacity="0.5" />
          <line x1="-15" y1="665" x2="15" y2="635" stroke="#6B5530" strokeWidth="1" opacity="0.5" />
          <ellipse cx="0" cy="650" rx="28" ry="28" fill="none" stroke="#9B8348" strokeWidth="0.5" strokeDasharray="4 3" />
        </motion.g>

        {/* Hay bale 2 - rolling right to left, slightly behind */}
        <motion.g
          animate={{ x: [1700, -200], rotate: [0, -720] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear', delay: 3 }}
        >
          <circle cx="0" cy="580" r="22" fill="#7B6335" stroke="#5B4525" strokeWidth="2" />
          <circle cx="0" cy="580" r="22" fill="none" stroke="#9B8348" strokeWidth="1" opacity="0.4" />
          <line x1="-15" y1="572" x2="15" y2="588" stroke="#5B4525" strokeWidth="1" opacity="0.5" />
          <line x1="-12" y1="592" x2="12" y2="568" stroke="#5B4525" strokeWidth="1" opacity="0.5" />
        </motion.g>

        {/* Hay bale 3 - small, fast */}
        <motion.g
          animate={{ x: [-150, 1700], rotate: [0, 1440] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear', delay: 8 }}
        >
          <circle cx="0" cy="720" r="18" fill="#9B8348" stroke="#7B6335" strokeWidth="1.5" />
          <line x1="-12" y1="712" x2="12" y2="728" stroke="#7B6335" strokeWidth="1" opacity="0.5" />
          <line x1="-10" y1="730" x2="10" y2="710" stroke="#7B6335" strokeWidth="1" opacity="0.5" />
        </motion.g>

        {/* Static hay bales in the background */}
        <circle cx="350" cy="530" r="14" fill="#6B5530" opacity="0.4" />
        <circle cx="1100" cy="540" r="16" fill="#6B5530" opacity="0.35" />
        <circle cx="600" cy="520" r="10" fill="#5B4525" opacity="0.3" />

        {/* Dust particles floating */}
        {[
          { cx: 300, cy: 600, r: 2, delay: 0 },
          { cx: 600, cy: 550, r: 1.5, delay: 1 },
          { cx: 900, cy: 620, r: 2, delay: 2 },
          { cx: 1200, cy: 570, r: 1.5, delay: 0.5 },
          { cx: 450, cy: 680, r: 1, delay: 3 },
          { cx: 1050, cy: 640, r: 1.5, delay: 1.5 },
        ].map((p, i) => (
          <motion.circle
            key={`dust-${i}`}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="#c4a060"
            animate={{
              opacity: [0, 0.3, 0],
              y: [0, -30, -60],
              x: [0, 15, 30],
            }}
            transition={{
              duration: 4,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Tumbleweed paths (subtle dashed lines) */}
        <motion.path
          d="M100 650 Q400 600 700 660 T1300 610"
          fill="none"
          stroke="#8b7355"
          strokeWidth="0.5"
          strokeDasharray="3 8"
          opacity="0.15"
          animate={{ strokeDashoffset: [0, -50] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Stars in the sky */}
        {[
          { cx: 100, cy: 80 }, { cx: 250, cy: 120 }, { cx: 400, cy: 60 },
          { cx: 600, cy: 150 }, { cx: 800, cy: 90 }, { cx: 1000, cy: 130 },
          { cx: 1150, cy: 70 }, { cx: 1300, cy: 110 }, { cx: 1400, cy: 50 },
          { cx: 180, cy: 200 }, { cx: 500, cy: 250 }, { cx: 900, cy: 220 },
          { cx: 1100, cy: 180 }, { cx: 700, cy: 30 }, { cx: 1250, cy: 200 },
        ].map((star, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={0.8 + Math.random() * 0.8}
            fill="#e8d4a0"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 3,
              repeat: Infinity,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
