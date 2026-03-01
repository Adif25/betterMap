'use client'

import { create } from 'zustand'
import type { Trip, Destination, RouteData } from '@/types'

type TripStore = {
  currentTrip: Trip | null
  savedTrips: Trip[]
  activeRouteIndex: number // 0 = best route, 1+ = alternates

  setCurrentTrip: (trip: Trip) => void
  setDestinations: (destinations: Destination[]) => void
  setRoute: (route: RouteData) => void
  addAlternateRoute: (route: RouteData) => void
  setActiveRouteIndex: (index: number) => void
  updateDestination: (id: string, updates: Partial<Destination>) => void
  reorderDestinations: (fromIndex: number, toIndex: number) => void
  removeDestination: (id: string) => void
  addDestination: (destination: Destination) => void

  saveCurrentTrip: () => void
  loadTrip: (tripId: string) => void
  deleteSavedTrip: (tripId: string) => void
  loadSavedTrips: () => void

  clearCurrentTrip: () => void
}

export const useTripStore = create<TripStore>((set, get) => ({
  currentTrip: null,
  savedTrips: [],
  activeRouteIndex: 0,

  setCurrentTrip: (trip) => set({ currentTrip: trip, activeRouteIndex: 0 }),

  setDestinations: (destinations) =>
    set((state) => ({
      currentTrip: state.currentTrip
        ? { ...state.currentTrip, destinations }
        : null,
    })),

  setRoute: (route) =>
    set((state) => ({
      currentTrip: state.currentTrip
        ? { ...state.currentTrip, route, alternateRoutes: [] }
        : null,
      activeRouteIndex: 0,
    })),

  addAlternateRoute: (route) =>
    set((state) => ({
      currentTrip: state.currentTrip
        ? {
            ...state.currentTrip,
            alternateRoutes: [...state.currentTrip.alternateRoutes, route],
          }
        : null,
    })),

  setActiveRouteIndex: (index) => set({ activeRouteIndex: index }),

  updateDestination: (id, updates) =>
    set((state) => ({
      currentTrip: state.currentTrip
        ? {
            ...state.currentTrip,
            destinations: state.currentTrip.destinations.map((d) =>
              d.id === id ? { ...d, ...updates } : d
            ),
          }
        : null,
    })),

  reorderDestinations: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.currentTrip) return state
      const destinations = [...state.currentTrip.destinations]
      const [moved] = destinations.splice(fromIndex, 1)
      destinations.splice(toIndex, 0, moved)
      return {
        currentTrip: {
          ...state.currentTrip,
          destinations: destinations.map((d, i) => ({ ...d, order: i })),
        },
      }
    }),

  removeDestination: (id) =>
    set((state) => ({
      currentTrip: state.currentTrip
        ? {
            ...state.currentTrip,
            destinations: state.currentTrip.destinations
              .filter((d) => d.id !== id)
              .map((d, i) => ({ ...d, order: i })),
          }
        : null,
    })),

  addDestination: (destination) =>
    set((state) => ({
      currentTrip: state.currentTrip
        ? {
            ...state.currentTrip,
            destinations: [
              ...state.currentTrip.destinations,
              { ...destination, order: state.currentTrip.destinations.length },
            ],
          }
        : null,
    })),

  saveCurrentTrip: () => {
    const { currentTrip } = get()
    if (!currentTrip) return

    const saved = JSON.parse(localStorage.getItem('bettermap_trips') || '[]') as Trip[]
    const existing = saved.findIndex((t) => t.id === currentTrip.id)
    if (existing >= 0) {
      saved[existing] = currentTrip
    } else {
      saved.push(currentTrip)
    }
    localStorage.setItem('bettermap_trips', JSON.stringify(saved))
    set({ savedTrips: saved })
  },

  loadTrip: (tripId) => {
    const saved = JSON.parse(localStorage.getItem('bettermap_trips') || '[]') as Trip[]
    const trip = saved.find((t) => t.id === tripId)
    if (trip) {
      // Backward compat: old trips may not have mode
      if (!trip.mode) trip.mode = 'task'
      set({ currentTrip: trip, activeRouteIndex: 0 })
    }
  },

  deleteSavedTrip: (tripId) => {
    const saved = JSON.parse(localStorage.getItem('bettermap_trips') || '[]') as Trip[]
    const filtered = saved.filter((t) => t.id !== tripId)
    localStorage.setItem('bettermap_trips', JSON.stringify(filtered))
    set({ savedTrips: filtered })
  },

  loadSavedTrips: () => {
    const saved = JSON.parse(localStorage.getItem('bettermap_trips') || '[]') as Trip[]
    set({ savedTrips: saved })
  },

  clearCurrentTrip: () => set({ currentTrip: null, activeRouteIndex: 0 }),
}))
