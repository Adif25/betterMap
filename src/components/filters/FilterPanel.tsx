'use client'

import { X, Mountain, MapPinned, CircleDollarSign, Car, UtensilsCrossed } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFilterStore } from '@/store/filterStore'
import Toggle from '@/components/ui/Toggle'
import type { FilterState, TripMode } from '@/types'

type FilterPanelProps = {
  isOpen: boolean
  onClose: () => void
  mode?: TripMode
}

export default function FilterPanel({ isOpen, onClose, mode = 'task' }: FilterPanelProps) {
  const filters = useFilterStore()

  // In task mode, hide journey-specific filters (suggestStops, foodHotspots)
  const journeyOnlyKeys: (keyof FilterState)[] = ['suggestStops', 'foodHotspots']

  const allFilterOptions: {
    key: keyof FilterState
    label: string
    icon: React.ReactNode
    description: string
  }[] = [
    {
      key: 'scenicRoute',
      label: 'Scenic Route',
      icon: <Mountain size={16} className="text-amber-500" />,
      description: 'Prefer routes with great scenery',
    },
    {
      key: 'suggestStops',
      label: 'Suggest Stops',
      icon: <MapPinned size={16} className="text-amber-500" />,
      description: 'Show high-rated hotspot locations nearby',
    },
    {
      key: 'avoidTolls',
      label: 'Avoid Tolls',
      icon: <CircleDollarSign size={16} className="text-amber-500" />,
      description: 'Route around toll roads',
    },
    {
      key: 'avoidHighways',
      label: 'Avoid Highways',
      icon: <Car size={16} className="text-amber-500" />,
      description: 'Prefer local roads over highways',
    },
    {
      key: 'foodHotspots',
      label: 'Food Hotspots',
      icon: <UtensilsCrossed size={16} className="text-amber-500" />,
      description: 'Suggest popular food stops along the way',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#1e0f06] border-l border-amber-900/20 z-50 p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-amber-100">Filters</h2>
              <button
                onClick={onClose}
                className="text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              {allFilterOptions
                .filter((f) => mode === 'journey' || !journeyOnlyKeys.includes(f.key))
                .map((filter) => (
                <div key={filter.key} className="py-2">
                  <div className="flex items-center gap-2 mb-1">
                    {filter.icon}
                    <Toggle
                      label={filter.label}
                      enabled={filters[filter.key] as boolean}
                      onToggle={() => filters.toggleFilter(filter.key)}
                    />
                  </div>
                  <p className="text-[11px] text-amber-200/20 ml-6">
                    {filter.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                filters.resetFilters()
              }}
              className="mt-8 text-xs text-amber-200/20 hover:text-amber-200/40 transition-colors cursor-pointer"
            >
              Reset all filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
