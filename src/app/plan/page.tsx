'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Locate, AlertCircle, Home, X, Check, Zap, Compass } from 'lucide-react'
import SearchBar from '@/components/plan/SearchBar'
import CowboyHen from '@/components/plan/CowboyHen'
import { useTripStore } from '@/store/tripStore'
import { useLocationStore } from '@/store/locationStore'
import { parseTripInput } from '@/lib/claude-parser'
import type { Trip, Destination, TripMode } from '@/types'

export default function PlanPage() {
  const router = useRouter()
  const setCurrentTrip = useTripStore((s) => s.setCurrentTrip)
  const { userLocation, locationStatus, requestLocation, homeAddress, setHomeAddress, loadHomeAddress } = useLocationStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tripMode, setTripMode] = useState<TripMode>('task')
  const [showHomePopup, setShowHomePopup] = useState(false)
  const [homeInput, setHomeInput] = useState('')
  const homeInputRef = useRef<HTMLInputElement>(null)

  // Load home address and request location on page load
  useEffect(() => {
    loadHomeAddress()
    if (locationStatus === 'idle') {
      requestLocation()
    }
  }, [locationStatus, requestLocation, loadHomeAddress])

  // Focus home input when popup opens
  useEffect(() => {
    if (showHomePopup && homeInputRef.current) {
      homeInputRef.current.focus()
    }
  }, [showHomePopup])

  const handleSaveHome = () => {
    const trimmed = homeInput.trim()
    if (trimmed) {
      setHomeAddress(trimmed)
    }
    setShowHomePopup(false)
    setHomeInput('')
  }

  const handleSubmit = async (text: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const parsedDestinations = await parseTripInput(text)

      // Build final destinations list
      const destinations: Destination[] = []

      // If home address is set, prepend it as the starting point
      if (homeAddress) {
        const hasHome = parsedDestinations.some(
          (d) => d.name.toLowerCase() === 'home' && d.order === 0
        )
        if (!hasHome) {
          destinations.push({
            id: crypto.randomUUID(),
            name: 'Home',
            address: homeAddress.address,
            purpose: 'Starting point',
            items: [],
            estimatedTaskTime: 0,
            order: 0,
            lat: homeAddress.lat,
            lng: homeAddress.lng,
          })
        }
      }

      // Add parsed destinations (reindex orders)
      const startOrder = destinations.length
      for (const d of parsedDestinations) {
        if (d.name.toLowerCase() === 'home' && homeAddress) {
          destinations.push({
            ...d,
            address: homeAddress.address,
            lat: homeAddress.lat,
            lng: homeAddress.lng,
            order: startOrder + destinations.length - (startOrder > 0 ? startOrder : 0),
          })
        } else {
          destinations.push({
            ...d,
            order: startOrder + destinations.length - (startOrder > 0 ? startOrder : 0),
          })
        }
      }

      // Re-number orders cleanly
      destinations.forEach((d, i) => { d.order = i })

      const trip: Trip = {
        id: crypto.randomUUID(),
        name: `${tripMode === 'task' ? 'Errands' : 'Journey'} - ${new Date().toLocaleDateString()}`,
        mode: tripMode,
        destinations,
        route: null,
        alternateRoutes: [],
        filters: {
          scenicRoute: false,
          suggestStops: false,
          avoidTolls: false,
          avoidHighways: false,
          foodHotspots: false,
        },
        totalEstimatedTime: 0,
        createdAt: new Date().toISOString(),
      }

      setCurrentTrip(trip)
      router.push('/route')
    } catch {
      setError('Failed to parse your trip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0a05] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={() => router.push('/')}
          className="text-amber-200/30 hover:text-amber-200/70 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-3">
          {/* Home address button */}
          <button
            onClick={() => { setHomeInput(homeAddress?.address || ''); setShowHomePopup(true) }}
            className={`flex items-center gap-2 text-xs rounded-full px-3 py-1.5 cursor-pointer transition-colors ${
              homeAddress
                ? 'text-amber-500/70 bg-amber-900/20 hover:bg-amber-900/30'
                : 'text-amber-700/50 bg-amber-950/30 hover:bg-amber-900/20 border border-dashed border-amber-800/20'
            }`}
          >
            <Home size={12} />
            <span>{homeAddress ? homeAddress.address.slice(0, 25) + (homeAddress.address.length > 25 ? '...' : '') : 'Set home'}</span>
          </button>

          {/* Location status badge */}
          <LocationBadge
            status={locationStatus}
            city={userLocation?.city}
            onRetry={requestLocation}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mt-8">
        {/* Small cowboy hen */}
        <CowboyHen className="-mb-4 scale-[0.65]" />

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-amber-100 mb-4 -mt-2"
        >
          Plan your trip
        </motion.h1>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center bg-amber-950/40 border border-amber-900/20 rounded-xl p-1 mb-4"
        >
          <button
            onClick={() => setTripMode('task')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tripMode === 'task'
                ? 'bg-[#8B2500] text-amber-100 shadow-lg shadow-[#5a1800]/40'
                : 'text-amber-200/40 hover:text-amber-200/60'
            }`}
          >
            <Zap size={15} />
            Task
          </button>
          <button
            onClick={() => setTripMode('journey')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tripMode === 'journey'
                ? 'bg-[#8B2500] text-amber-100 shadow-lg shadow-[#5a1800]/40'
                : 'text-amber-200/40 hover:text-amber-200/60'
            }`}
          >
            <Compass size={15} />
            Journey
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-amber-700/50 mb-4 text-center max-w-lg text-sm"
        >
          {tripMode === 'task'
            ? 'Fastest route for your errands — get in, get out, get home.'
            : 'Explore with food & hotspot suggestions along the way.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <SearchBar onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        {/* Location denied warning */}
        {locationStatus === 'denied' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-2 text-amber-500/60 text-xs bg-amber-900/10 border border-amber-800/15 rounded-xl px-4 py-2"
          >
            <AlertCircle size={14} />
            <span>
              Location access denied. The app may find stores far from you.{' '}
              <button
                onClick={requestLocation}
                className="underline cursor-pointer"
              >
                Try again
              </button>
            </span>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 mt-4 text-sm"
          >
            {error}
          </motion.p>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-amber-600/50 text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#C44020] animate-pulse" />
            Parsing your trip and finding the best route...
          </motion.div>
        )}
      </div>

      {/* Home Address Popup */}
      <AnimatePresence>
        {showHomePopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHomePopup(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#2a1508] border border-amber-800/20 rounded-2xl p-6 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-amber-100 flex items-center gap-2">
                  <Home size={16} className="text-amber-500" />
                  Set Home Address
                </h3>
                <button
                  onClick={() => setShowHomePopup(false)}
                  className="text-amber-200/30 hover:text-amber-200/60 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-amber-700/50 mb-4">
                Trips will automatically start from this address.
              </p>
              <div className="flex items-center gap-2">
                <input
                  ref={homeInputRef}
                  type="text"
                  value={homeInput}
                  onChange={(e) => setHomeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveHome()
                    if (e.key === 'Escape') setShowHomePopup(false)
                  }}
                  placeholder="123 Main Street, City, State..."
                  className="flex-1 bg-amber-950/40 border border-amber-800/20 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder:text-amber-800/40 outline-none focus:border-amber-700/40 transition-colors"
                />
                <button
                  onClick={handleSaveHome}
                  className="p-3 bg-[#8B2500] hover:bg-[#A03000] rounded-xl text-amber-100 cursor-pointer transition-colors"
                >
                  <Check size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Location status badge component
function LocationBadge({
  status,
  city,
  onRetry,
}: {
  status: string
  city?: string
  onRetry: () => void
}) {
  if (status === 'requesting') {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600/40 bg-amber-950/30 rounded-full px-3 py-1.5">
        <Locate size={12} className="animate-pulse" />
        <span>Finding location...</span>
      </div>
    )
  }

  if (status === 'granted' && city) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-500/60 bg-amber-900/15 rounded-full px-3 py-1.5">
        <MapPin size={12} />
        <span>{city}</span>
      </div>
    )
  }

  if (status === 'granted') {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-500/50 bg-amber-900/15 rounded-full px-3 py-1.5">
        <MapPin size={12} />
        <span>Location detected</span>
      </div>
    )
  }

  if (status === 'denied' || status === 'error') {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-xs text-amber-600/40 bg-amber-950/30 rounded-full px-3 py-1.5 cursor-pointer hover:bg-amber-900/20 transition-colors"
      >
        <MapPin size={12} />
        <span>Enable location</span>
      </button>
    )
  }

  return null
}
