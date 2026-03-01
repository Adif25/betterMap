'use client'

import { useTripStore } from '@/store/tripStore'
import DestinationCard from './DestinationCard'

export default function Sidebar() {
  const currentTrip = useTripStore((s) => s.currentTrip)
  const activeRouteIndex = useTripStore((s) => s.activeRouteIndex)

  if (!currentTrip) return null

  const activeRoute =
    activeRouteIndex === 0
      ? currentTrip.route
      : currentTrip.alternateRoutes[activeRouteIndex - 1]

  return (
    <div className="w-full h-full overflow-y-auto bg-[#1a0a05]/95 backdrop-blur-sm p-5">
      <h2 className="text-sm font-semibold text-amber-200/50 uppercase tracking-wider mb-4">
        Destinations
      </h2>

      <div>
        {currentTrip.destinations.map((dest, i) => (
          <DestinationCard
            key={dest.id}
            destination={dest}
            index={i}
            legDuration={activeRoute?.legs?.[i]?.duration}
          />
        ))}
      </div>
    </div>
  )
}
