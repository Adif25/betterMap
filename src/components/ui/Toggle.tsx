'use client'

type ToggleProps = {
  label: string
  enabled: boolean
  onToggle: () => void
}

export default function Toggle({ label, enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 px-1 cursor-pointer"
    >
      <span className="text-sm text-amber-100/80">{label}</span>
      <div
        className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
          enabled ? 'bg-[#8B2500]' : 'bg-amber-900/20'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
            enabled ? 'translate-x-5.5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}
