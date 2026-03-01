'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import VoiceButton from './VoiceButton'

type SearchBarProps = {
  onSubmit: (text: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSubmit, isLoading }: SearchBarProps) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim())
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-amber-950/30 border border-amber-800/20 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={`Example: I want to go to Food Lion, I need tomatoes, cereal, and plastic bags. Then I need to go to Home Depot for screwdrivers and drywall. Then I need to go home, and from there go to my cousin's house...`}
          rows={5}
          className="w-full bg-transparent text-amber-100 placeholder-amber-700/40 p-6 pr-28 resize-none focus:outline-none text-base leading-relaxed"
        />

        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <VoiceButton onTranscript={handleVoiceTranscript} />

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-[#8B2500] hover:bg-[#A03000] text-amber-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Character hint */}
      <p className="text-xs text-amber-700/40 mt-3 text-right">
        Press Enter to submit, Shift+Enter for new line
      </p>
    </div>
  )
}
