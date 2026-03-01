'use client'

import { Clock, MapPin, ExternalLink, Package } from 'lucide-react'
import type { Destination } from '@/types'

type DestinationCardProps = {
  destination: Destination
  legDuration?: string
  index: number
}

export default function DestinationCard({
  destination,
  legDuration,
  index,
}: DestinationCardProps) {
  return (
    <div className="border-b border-amber-900/15 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#8B2500] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-amber-100">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-amber-100 font-medium text-sm truncate">
            {destination.name}
          </h3>
          <p className="text-amber-200/35 text-xs mt-0.5">{destination.purpose}</p>
        </div>
      </div>

      {/* Driving time to this stop */}
      {legDuration && (
        <div className="flex items-center gap-1.5 mt-2 ml-10">
          <MapPin size={12} className="text-amber-600/60" />
          <span className="text-xs text-amber-200/30">{legDuration} drive</span>
        </div>
      )}

      {/* Time at location */}
      <div className="flex items-center gap-1.5 mt-1 ml-10">
        <Clock size={12} className="text-amber-200/25" />
        <span className="text-xs text-amber-200/25">
          ~{destination.estimatedTaskTime} min here
        </span>
      </div>

      {/* Items */}
      {destination.items.length > 0 && (
        <div className="mt-3 ml-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Package size={12} className="text-amber-200/25" />
            <span className="text-xs text-amber-200/35 font-medium">Items needed:</span>
          </div>
          <ul className="space-y-1">
            {destination.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-xs">
                <span className="text-amber-200/55">{item.name}</span>
                {item.aisle ? (
                  <span className="text-amber-500 text-[10px]">{item.aisle}</span>
                ) : !item.storeHasWebsite ? (
                  <span className="text-amber-200/15 text-[10px] italic">
                    No website
                  </span>
                ) : (
                  <a
                    href={`#`}
                    className="text-amber-600/50 hover:text-amber-500 text-[10px] flex items-center gap-0.5"
                  >
                    Find <ExternalLink size={8} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
