'use client'

import { Minus, Plus } from 'lucide-react'

type TimeEditorProps = {
  minutes: number
  onChange: (minutes: number) => void
}

export default function TimeEditor({ minutes, onChange }: TimeEditorProps) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={() => onChange(Math.max(5, minutes - 5))}
        className="w-5 h-5 flex items-center justify-center rounded bg-amber-900/15 hover:bg-amber-900/25 text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
      >
        <Minus size={10} />
      </button>

      <span className="text-xs text-amber-200/50 w-12 text-center tabular-nums">
        {minutes} min
      </span>

      <button
        onClick={() => onChange(minutes + 5)}
        className="w-5 h-5 flex items-center justify-center rounded bg-amber-900/15 hover:bg-amber-900/25 text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
      >
        <Plus size={10} />
      </button>
    </div>
  )
}
