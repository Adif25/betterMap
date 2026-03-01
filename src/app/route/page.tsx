'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, SlidersHorizontal, Pencil, Play, Save, Zap, Compass } from 'lucide-react'
import MapView from '@/components/map/MapView'
import RouteOverlay from '@/components/map/RouteOverlay'
import Sidebar from '@/components/route/Sidebar'
import TripTimer from '@/components/route/TripTimer'
import RemapButton from '@/components/route/RemapButton'
import FilterPanel from '@/components/filters/FilterPanel'
import Button from '@/components/ui/Button'
import { useTripStore } from '@/store/tripStore'
import { useFilterStore } from '@/store/filterStore'
import { optimizeRoute } from '@/lib/route-optimizer'

export default function RoutePage() {
  const router = useRouter()
  const currentTrip = useTripStore((s) => s.currentTrip)
  const setRoute = useTripStore((s) => s.setRoute)
  const addAlternateRoute = useTripStore((s) => s.addAlternateRoute)
  const activeRouteIndex = useTripStore((s) => s.activeRouteIndex)
  const saveCurrentTrip = useTripStore((s) => s.saveCurrentTrip)
  const filters = useFilterStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Redirect if no trip
  useEffect(() => {
    if (!currentTrip) {
      router.push('/plan')
    }
  }, [currentTrip, router])

  const updateDestination = useTripStore((s) => s.updateDestination)

  // Auto-enable journey filters when in journey mode
  useEffect(() => {
    if (currentTrip?.mode === 'journey') {
      filters.setFilters({ suggestStops: true, foodHotspots: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrip?.mode])

  // Optimize route on load and when filters change
  useEffect(() => {
    if (!currentTrip || currentTrip.destinations.length < 2) return
    if (currentTrip.route) return // Already have a route

    const fetchRoute = async () => {
      setIsOptimizing(true)
      try {
        const result = await optimizeRoute(
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
          }
        )
        setRoute(result.route)

        // Store any alternative routes Google returned (different roads)
        if (result.alternateRoutes && result.alternateRoutes.length > 0) {
          result.alternateRoutes.forEach((altRoute) => {
            addAlternateRoute(altRoute)
          })
        }

        // Update destinations with resolved real addresses and coordinates
        if (result.resolvedDestinations) {
          result.resolvedDestinations.forEach((resolved, i) => {
            if (resolved && currentTrip.destinations[i]) {
              updateDestination(currentTrip.destinations[i].id, {
                address: resolved.address,
                lat: resolved.lat,
                lng: resolved.lng,
              })
            }
          })
        }
      } catch {
        // Handle error silently for now
      } finally {
        setIsOptimizing(false)
      }
    }

    fetchRoute()
  }, [currentTrip, filters.avoidTolls, filters.avoidHighways, filters.scenicRoute, filters.suggestStops, filters.foodHotspots, setRoute, addAlternateRoute, updateDestination])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapLoad = useCallback((m: any) => {
    setMap(m)
  }, [])

  if (!currentTrip) return null

  return (
    <div className="h-screen flex flex-col bg-[#1a0a05]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-amber-900/20 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/plan')}
            className="text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-medium text-amber-200/60">
            {currentTrip.name}
          </h1>
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            currentTrip.mode === 'journey'
              ? 'bg-amber-600/15 text-amber-500'
              : 'bg-[#8B2500]/20 text-[#C44020]'
          }`}>
            {currentTrip.mode === 'journey' ? <Compass size={10} /> : <Zap size={10} />}
            {currentTrip.mode === 'journey' ? 'Journey' : 'Task'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveCurrentTrip()
            }}
            className="p-2 text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
            title="Save trip"
          >
            <Save size={18} />
          </button>
          <button
            onClick={() => setFiltersOpen(true)}
            className="p-2 text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
            title="Filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            className="w-full h-full"
            onMapLoad={handleMapLoad}
          />
          <RouteOverlay
            map={map}
            route={currentTrip.route}
            alternateRoutes={currentTrip.alternateRoutes}
            activeRouteIndex={activeRouteIndex}
            destinations={currentTrip.destinations}
          />

          {isOptimizing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#2a1508] px-6 py-3 rounded-2xl text-sm text-amber-200/60 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#C44020] animate-pulse" />
                Finding the best route...
              </motion.div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-amber-900/20 overflow-hidden">
          <Sidebar />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-amber-900/20">
        <TripTimer />

        <div className="flex items-center gap-3">
          <RemapButton />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/edit')}
            className="flex items-center gap-2"
          >
            <Pencil size={14} />
            Edit
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/journey')}
            className="flex items-center gap-2"
          >
            <Play size={14} />
            Go
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <FilterPanel isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} mode={currentTrip.mode} />
    </div>
  )
}
