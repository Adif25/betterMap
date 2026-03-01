'use client'

import { X, Star, MapPin, UtensilsCrossed } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HotspotSuggestion } from '@/types'

type SuggestionPopupProps = {
  suggestion: HotspotSuggestion | null
  onDismiss: () => void
}

export default function SuggestionPopup({
  suggestion,
  onDismiss,
}: SuggestionPopupProps) {
  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="bg-[#2a1508]/95 backdrop-blur-md border border-amber-900/20 rounded-2xl p-4 min-w-[280px] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    suggestion.type === 'food'
                      ? 'bg-orange-500/10'
                      : 'bg-amber-500/10'
                  }`}
                >
                  {suggestion.type === 'food' ? (
                    <UtensilsCrossed
                      size={18}
                      className="text-orange-400"
                    />
                  ) : (
                    <MapPin size={18} className="text-amber-500" />
                  )}
                </div>

                <div>
                  <p className="text-xs text-amber-200/30 mb-0.5">
                    {suggestion.type === 'food'
                      ? 'Popular food spot nearby'
                      : 'High-rated location nearby'}
                  </p>
                  <h3 className="text-sm font-medium text-amber-100">
                    {suggestion.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-amber-200/50">
                        {suggestion.rating}
                      </span>
                    </div>
                    <span className="text-xs text-amber-200/20">
                      {suggestion.address}
                    </span>
                    {suggestion.detourTime && (
                      <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        {suggestion.detourTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="text-amber-200/20 hover:text-amber-200/50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
