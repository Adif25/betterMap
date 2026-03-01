'use client'

import { useState } from 'react'
import { GripVertical, Trash2, Plus, Clock } from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useTripStore } from '@/store/tripStore'
import type { Destination } from '@/types'
import TimeEditor from './TimeEditor'

export default function EditableList() {
  const currentTrip = useTripStore((s) => s.currentTrip)
  const setDestinations = useTripStore((s) => s.setDestinations)
  const removeDestination = useTripStore((s) => s.removeDestination)
  const addDestination = useTripStore((s) => s.addDestination)
  const updateDestination = useTripStore((s) => s.updateDestination)
  const [newName, setNewName] = useState('')

  if (!currentTrip) return null

  const handleReorder = (newOrder: Destination[]) => {
    setDestinations(newOrder.map((d, i) => ({ ...d, order: i })))
  }

  const handleAddDestination = () => {
    if (!newName.trim()) return
    addDestination({
      id: crypto.randomUUID(),
      name: newName.trim(),
      address: '',
      purpose: 'Added manually',
      items: [],
      estimatedTaskTime: 15,
      order: currentTrip.destinations.length,
    })
    setNewName('')
  }

  const totalTaskTime = currentTrip.destinations.reduce(
    (sum, d) => sum + d.estimatedTaskTime,
    0
  )

  const totalDrivingMin = currentTrip.route
    ? Math.round(currentTrip.route.totalDurationValue / 60)
    : 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Summary */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-amber-900/10 border border-amber-900/15 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-500" />
          <div>
            <p className="text-xs text-amber-200/30">Total trip</p>
            <p className="text-sm text-amber-100 font-medium">
              {totalDrivingMin + totalTaskTime} min
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-amber-900/20" />
        <div>
          <p className="text-xs text-amber-200/30">Driving</p>
          <p className="text-sm text-amber-200/60">{totalDrivingMin} min</p>
        </div>
        <div className="h-8 w-px bg-amber-900/20" />
        <div>
          <p className="text-xs text-amber-200/30">At stops</p>
          <p className="text-sm text-amber-200/60">{totalTaskTime} min</p>
        </div>
        <div className="h-8 w-px bg-amber-900/20" />
        <div>
          <p className="text-xs text-amber-200/30">Stops</p>
          <p className="text-sm text-amber-200/60">{currentTrip.destinations.length}</p>
        </div>
      </div>

      {/* Reorderable list */}
      <Reorder.Group
        axis="y"
        values={currentTrip.destinations}
        onReorder={handleReorder}
        className="space-y-2"
      >
        <AnimatePresence>
          {currentTrip.destinations.map((dest, i) => (
            <Reorder.Item
              key={dest.id}
              value={dest}
              className="flex items-center gap-3 bg-amber-900/10 border border-amber-900/15 rounded-xl p-4 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} className="text-amber-200/20 shrink-0" />

              <div className="w-6 h-6 rounded-full bg-[#8B2500] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-amber-100">
                  {i + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={dest.name}
                  onChange={(e) =>
                    updateDestination(dest.id, { name: e.target.value })
                  }
                  className="w-full bg-transparent text-amber-100 text-sm focus:outline-none"
                />
                <p className="text-[11px] text-amber-200/30 mt-0.5">
                  {dest.purpose}
                </p>
              </div>

              <TimeEditor
                minutes={dest.estimatedTaskTime}
                onChange={(minutes) =>
                  updateDestination(dest.id, { estimatedTaskTime: minutes })
                }
              />

              <button
                onClick={() => removeDestination(dest.id)}
                className="p-1.5 text-amber-200/10 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add destination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 flex gap-2"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddDestination()}
          placeholder="Add a destination..."
          className="flex-1 bg-amber-900/10 border border-amber-900/15 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-amber-700/30 focus:outline-none focus:border-amber-700/30"
        />
        <button
          onClick={handleAddDestination}
          disabled={!newName.trim()}
          className="p-3 bg-[#8B2500]/20 hover:bg-[#8B2500]/30 rounded-xl text-amber-500 disabled:opacity-20 transition-colors cursor-pointer"
        >
          <Plus size={18} />
        </button>
      </motion.div>
    </div>
  )
}
