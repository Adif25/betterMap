'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import MapView from '@/components/map/MapView'
import RouteOverlay from '@/components/map/RouteOverlay'
import MinimalNav from '@/components/journey/MinimalNav'
import SuggestionPopup from '@/components/journey/SuggestionPopup'
import { useTripStore } from '@/store/tripStore'
import { useFilterStore } from '@/store/filterStore'
import type { HotspotSuggestion } from '@/types'

export default function JourneyPage() {
  const router = useRouter()
  const currentTrip = useTripStore((s) => s.currentTrip)
  const activeRouteIndex = useTripStore((s) => s.activeRouteIndex)
  const suggestStops = useFilterStore((s) => s.suggestStops)
  const foodHotspots = useFilterStore((s) => s.foodHotspots)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null)
  const [activeSuggestion, setActiveSuggestion] =
    useState<HotspotSuggestion | null>(null)

  const isJourneyMode = currentTrip?.mode === 'journey'

  useEffect(() => {
    if (!currentTrip) {
      router.push('/plan')
    }
  }, [currentTrip, router])

  // Simulate suggestion popups — only in journey mode when filters are active
  useEffect(() => {
    if (!isJourneyMode) return
    if (!suggestStops && !foodHotspots) return

    const timer = setTimeout(() => {
      if (suggestStops) {
        setActiveSuggestion({
          name: 'Scenic Viewpoint',
          rating: 4.7,
          address: 'Along your route',
          placeId: 'demo',
          type: 'attraction',
          lat: 0,
          lng: 0,
          detourTime: '+3 min',
        })
      } else if (foodHotspots) {
        setActiveSuggestion({
          name: 'Popular Local Restaurant',
          rating: 4.5,
          address: 'Along your route',
          placeId: 'demo',
          type: 'food',
          lat: 0,
          lng: 0,
          detourTime: '+7 min',
        })
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isJourneyMode, suggestStops, foodHotspots])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapLoad = useCallback((m: any) => {
    setMap(m)
  }, [])

  if (!currentTrip) return null

  return (
    <div className="h-screen relative bg-[#1a0a05]">
      {/* Full-screen map */}
      <MapView className="w-full h-full" onMapLoad={handleMapLoad} />
      <RouteOverlay
        map={map}
        route={currentTrip.route}
        alternateRoutes={currentTrip.alternateRoutes}
        activeRouteIndex={activeRouteIndex}
        destinations={currentTrip.destinations}
      />

      {/* Minimal navigation overlay */}
      <MinimalNav />

      {/* Exit button */}
      <button
        onClick={() => router.push('/route')}
        className="absolute top-5 right-5 z-30 w-10 h-10 bg-[#2a1508]/80 backdrop-blur-md border border-amber-900/20 rounded-full flex items-center justify-center text-amber-200/40 hover:text-amber-200/80 transition-colors cursor-pointer"
      >
        <X size={18} />
      </button>

      {/* Suggestion popup — only in journey mode when filters are on */}
      {isJourneyMode && (suggestStops || foodHotspots) && (
        <SuggestionPopup
          suggestion={activeSuggestion}
          onDismiss={() => setActiveSuggestion(null)}
        />
      )}
    </div>
  )
}
