'use client'

import { create } from 'zustand'
import type { FilterState } from '@/types'

type FilterStore = FilterState & {
  toggleFilter: (key: keyof FilterState) => void
  resetFilters: () => void
  setFilters: (filters: Partial<FilterState>) => void
}

const defaultFilters: FilterState = {
  scenicRoute: false,
  suggestStops: false,
  avoidTolls: false,
  avoidHighways: false,
  foodHotspots: false,
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultFilters,

  toggleFilter: (key) => set((state) => ({ [key]: !state[key] })),

  resetFilters: () => set(defaultFilters),

  setFilters: (filters) => set(filters),
}))
