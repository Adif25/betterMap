'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTripStore } from '@/store/tripStore'
import { useFilterStore } from '@/store/filterStore'
import { getAlternateRoute } from '@/lib/route-optimizer'

export default function RemapButton() {
  const currentTrip = useTripStore((s) => s.currentTrip)
  const addAlternateRoute = useTripStore((s) => s.addAlternateRoute)
  const setActiveRouteIndex = useTripStore((s) => s.setActiveRouteIndex)
  const activeRouteIndex = useTripStore((s) => s.activeRouteIndex)
  const filters = useFilterStore()
  const [isLoading, setIsLoading] = useState(false)

  const totalRoutes = 1 + (currentTrip?.alternateRoutes.length || 0)

  const handleRemap = async () => {
    if (!currentTrip || isLoading) return

    // If we already have alternate routes we haven't viewed yet, just cycle to the next one
    if (activeRouteIndex < totalRoutes - 1) {
      setActiveRouteIndex(activeRouteIndex + 1)
      return
    }

    // Otherwise, fetch a genuinely new route from Google
    setIsLoading(true)
    try {
      // Collect polylines of all routes we already have, so the API can exclude them
      const excludePolylines: string[] = []
      if (currentTrip.route?.polyline) {
        excludePolylines.push(currentTrip.route.polyline)
      }
      currentTrip.alternateRoutes.forEach((r) => {
        if (r.polyline) {
          excludePolylines.push(r.polyline)
        }
      })

      const altRoute = await getAlternateRoute(
        currentTrip.destinations.map((d) => ({
          address: d.address || d.name,
          lat: d.lat,
          lng: d.lng,
        })),
        {
          scenicRoute: filters.scenicRoute,
          suggestStops: filters.suggestStops,
          avoidTolls: filters.avoidTolls,
          avoidHighways: filters.avoidHighways,
          foodHotspots: filters.foodHotspots,
        },
        excludePolylines
      )

      // Only add if this is actually a different route (different polyline)
      const isDuplicate =
        altRoute.polyline === currentTrip.route?.polyline ||
        currentTrip.alternateRoutes.some((r) => r.polyline === altRoute.polyline)

      if (!isDuplicate) {
        addAlternateRoute(altRoute)
        setActiveRouteIndex(currentTrip.alternateRoutes.length + 1)
      } else {
        // If it's a duplicate, just cycle back to the first alternate
        if (totalRoutes > 1) {
          setActiveRouteIndex(activeRouteIndex === 0 ? 1 : 0)
        }
      }
    } catch {
      // No more alternatives available — cycle through existing ones
      if (totalRoutes > 1) {
        setActiveRouteIndex((activeRouteIndex + 1) % totalRoutes)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={handleRemap}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 bg-amber-900/15 hover:bg-amber-900/25 rounded-xl text-sm text-amber-200/50 hover:text-amber-100 transition-colors disabled:opacity-30 cursor-pointer"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        Remap
      </motion.button>

      {totalRoutes > 1 && (
        <div className="flex items-center gap-1">
          {Array.from({ length: totalRoutes }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveRouteIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                i === activeRouteIndex
                  ? 'bg-[#C44020]'
                  : 'bg-amber-900/20 hover:bg-amber-900/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
