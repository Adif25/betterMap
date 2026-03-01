'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MapPin, Bookmark } from 'lucide-react'
import Button from '@/components/ui/Button'
import AnimatedRoutes from './AnimatedRoutes'

export default function HeroSection() {
  const router = useRouter()

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a0a05]">
      {/* Animated desert background */}
      <AnimatedRoutes />

      {/* Warm overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a05]/70 via-transparent to-[#1a0a05]/90 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-6">
        {/* Logo / Title */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-4"
        >
          <span className="text-amber-100">Better</span>
          <span className="text-amber-600">Map</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-amber-200/40 mb-16 tracking-wide"
        >
          Start your adventure here
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/plan')}
            className="min-w-[220px] flex items-center justify-center gap-3"
          >
            <MapPin size={20} />
            Plan a New Trip
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push('/saved')}
            className="min-w-[220px] flex items-center justify-center gap-3"
          >
            <Bookmark size={20} />
            Saved Trips
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
