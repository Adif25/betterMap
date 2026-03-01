'use client'

import { create } from 'zustand'

type UserLocation = {
  lat: number
  lng: number
  city?: string
}

type HomeAddress = {
  address: string
  lat?: number
  lng?: number
}

type LocationStore = {
  userLocation: UserLocation | null
  locationStatus: 'idle' | 'requesting' | 'granted' | 'denied' | 'error'
  homeAddress: HomeAddress | null
  requestLocation: () => Promise<UserLocation | null>
  setManualLocation: (lat: number, lng: number) => void
  setHomeAddress: (address: string, lat?: number, lng?: number) => void
  clearHomeAddress: () => void
  loadHomeAddress: () => void
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  userLocation: null,
  locationStatus: 'idle',
  homeAddress: null,

  requestLocation: async () => {
    if (get().userLocation) return get().userLocation

    set({ locationStatus: 'requesting' })

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        set({ locationStatus: 'error' })
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }

          // Try to reverse geocode to get city name
          try {
            const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
            if (key && key !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lng}&key=${key}&result_type=locality`
              )
              const data = await res.json()
              if (data.results?.[0]) {
                loc.city = data.results[0].formatted_address
              }
            }
          } catch {
            // City name is optional, continue without it
          }

          set({ userLocation: loc, locationStatus: 'granted' })
          resolve(loc)
        },
        () => {
          set({ locationStatus: 'denied' })
          resolve(null)
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    })
  },

  setManualLocation: (lat, lng) => {
    set({
      userLocation: { lat, lng },
      locationStatus: 'granted',
    })
  },

  setHomeAddress: (address, lat?, lng?) => {
    const home: HomeAddress = { address, lat, lng }
    set({ homeAddress: home })
    // Persist to localStorage
    try {
      localStorage.setItem('bettermap-home', JSON.stringify(home))
    } catch {
      // localStorage not available
    }
  },

  clearHomeAddress: () => {
    set({ homeAddress: null })
    try {
      localStorage.removeItem('bettermap-home')
    } catch {
      // localStorage not available
    }
  },

  loadHomeAddress: () => {
    try {
      const saved = localStorage.getItem('bettermap-home')
      if (saved) {
        set({ homeAddress: JSON.parse(saved) })
      }
    } catch {
      // localStorage not available
    }
  },
}))
