'use client'

import { useMemo } from 'react'
import { Navigation, Clock } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { calculateTripTimes } from '@/lib/time-utils'

export default function MinimalNav() {
  const currentTrip = useTripStore((s) => s.currentTrip)
  const activeRouteIndex = useTripStore((s) => s.activeRouteIndex)

  const info = useMemo(() => {
    if (!currentTrip) return null

    const activeRoute =
      activeRouteIndex === 0
        ? currentTrip.route
        : currentTrip.alternateRoutes[activeRouteIndex - 1]

    if (!activeRoute) return null

    const totalTaskMinutes = currentTrip.destinations.reduce(
      (sum, d) => sum + d.estimatedTaskTime,
      0
    )

    const times = calculateTripTimes(
      activeRoute.totalDurationValue,
      totalTaskMinutes
    )

    // Next destination
    const nextDest = currentTrip.destinations[0]
    const nextLeg = activeRoute.legs[0]

    return {
      ...times,
      nextDestination: nextDest?.name || '',
      nextDuration: nextLeg?.duration || '',
      nextDistance: nextLeg?.distance || '',
    }
  }, [currentTrip, activeRouteIndex])

  if (!info) return null

  return (
    <div className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-4 mt-4 bg-[#2a1508]/90 backdrop-blur-md border border-amber-900/20 rounded-2xl p-4">
        {/* Next destination */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B2500] flex items-center justify-center">
            <Navigation size={18} className="text-amber-100" />
          </div>
          <div>
            <p className="text-amber-100 font-medium text-sm">
              {info.nextDestination}
            </p>
            <p className="text-amber-200/40 text-xs">
              {info.nextDistance} &middot; {info.nextDuration}
            </p>
          </div>
        </div>

        {/* ETA */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-900/20">
          <Clock size={12} className="text-amber-500" />
          <span className="text-xs text-amber-200/40">
            Trip ends at{' '}
            <span className="text-amber-500 font-medium">
              {info.finishTime}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
