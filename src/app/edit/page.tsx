'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play } from 'lucide-react'
import EditableList from '@/components/edit/EditableList'
import Button from '@/components/ui/Button'
import { useTripStore } from '@/store/tripStore'

export default function EditPage() {
  const router = useRouter()
  const currentTrip = useTripStore((s) => s.currentTrip)

  useEffect(() => {
    if (!currentTrip) {
      router.push('/plan')
    }
  }, [currentTrip, router])

  if (!currentTrip) return null

  return (
    <div className="min-h-screen bg-[#1a0a05] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/20">
        <button
          onClick={() => router.push('/route')}
          className="text-amber-200/30 hover:text-amber-200/60 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-amber-200/50"
        >
          Tap to edit time/edits
        </motion.h1>

        <div className="w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <EditableList />
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-amber-900/20">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push('/route')}
        >
          Save & Back
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
  )
}
