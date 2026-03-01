'use client'

import { useMemo } from 'react'
import { Clock, Navigation } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { calculateTripTimes, formatDuration } from '@/lib/time-utils'

export default function TripTimer() {
  const currentTrip = useTripStore((s) => s.currentTrip)
  const activeRouteIndex = useTripStore((s) => s.activeRouteIndex)

  const times = useMemo(() => {
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

    return {
      ...calculateTripTimes(activeRoute.totalDurationValue, totalTaskMinutes),
      totalDistance: activeRoute.totalDistance,
      taskTime: formatDuration(totalTaskMinutes),
    }
  }, [currentTrip, activeRouteIndex])

  if (!times) return null

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Navigation size={14} className="text-amber-500" />
        <span className="text-amber-200/55">
          {times.totalDuration} total
        </span>
        <span className="text-amber-200/20">|</span>
        <span className="text-amber-200/35">{times.totalDistance}</span>
      </div>

      <div className="flex items-center gap-2">
        <Clock size={14} className="text-amber-500" />
        <span className="text-amber-200/55">
          {times.startTime}
        </span>
        <span className="text-amber-200/25">&rarr;</span>
        <span className="text-amber-500 font-medium">
          {times.finishTime}
        </span>
      </div>
    </div>
  )
}
