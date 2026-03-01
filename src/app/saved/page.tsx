'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Trash2, Clock, ChevronRight } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { formatDuration } from '@/lib/time-utils'

export default function SavedPage() {
  const router = useRouter()
  const savedTrips = useTripStore((s) => s.savedTrips)
  const loadSavedTrips = useTripStore((s) => s.loadSavedTrips)
  const loadTrip = useTripStore((s) => s.loadTrip)
  const deleteSavedTrip = useTripStore((s) => s.deleteSavedTrip)

  useEffect(() => {
    loadSavedTrips()
  }, [loadSavedTrips])

  const handleLoad = (tripId: string) => {
    loadTrip(tripId)
    router.push('/route')
  }

  return (
    <div className="min-h-screen bg-[#1a0a05]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-amber-900/20">
        <button
          onClick={() => router.push('/')}
          className="text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-amber-100">Saved Trips</h1>
      </div>

      {/* Trip list */}
      <div className="p-6 max-w-2xl mx-auto">
        {savedTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <MapPin size={40} className="text-amber-900/30 mx-auto mb-4" />
            <p className="text-amber-200/30 text-sm">No saved trips yet</p>
            <p className="text-amber-200/15 text-xs mt-1">
              Plan a trip and save it to see it here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {savedTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-amber-900/10 border border-amber-900/15 rounded-xl p-4 hover:bg-amber-900/15 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLoad(trip.id)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <h3 className="text-sm font-medium text-amber-100">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-amber-200/30 flex items-center gap-1">
                        <MapPin size={10} />
                        {trip.destinations.length} stops
                      </span>
                      {trip.totalEstimatedTime > 0 && (
                        <span className="text-xs text-amber-200/30 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDuration(trip.totalEstimatedTime)}
                        </span>
                      )}
                      <span className="text-xs text-amber-200/20">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {trip.destinations.slice(0, 4).map((d, j) => (
                        <span
                          key={j}
                          className="text-[10px] text-amber-200/30 bg-amber-900/15 px-2 py-0.5 rounded-full"
                        >
                          {d.name}
                        </span>
                      ))}
                      {trip.destinations.length > 4 && (
                        <span className="text-[10px] text-amber-200/20">
                          +{trip.destinations.length - 4} more
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSavedTrip(trip.id)
                      }}
                      className="p-2 text-amber-200/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className="text-amber-200/10" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
