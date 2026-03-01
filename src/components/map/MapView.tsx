'use client'

import { useEffect, useRef, useState } from 'react'
import { darkMapStyle, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/google-maps'

// Global script loading state to prevent duplicates
let scriptLoadingPromise: Promise<void> | null = null

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.maps) return Promise.resolve()
  if (scriptLoadingPromise) return scriptLoadingPromise

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return Promise.resolve()
  }

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if script tag already exists
    const existing = document.querySelector(`script[src*="maps.googleapis.com"]`)
    if (existing) {
      if (window.google?.maps) {
        resolve()
      } else {
        existing.addEventListener('load', () => resolve())
      }
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

type MapViewProps = {
  center?: { lat: number; lng: number }
  zoom?: number
  children?: React.ReactNode
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMapLoad?: (map: any) => void
}

export default function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
  onMapLoad,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  // Load Google Maps script (singleton)
  useEffect(() => {
    loadGoogleMapsScript().then(() => setLoaded(true))
  }, [])

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current || map) return
    if (!window.google?.maps) return

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: darkMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      backgroundColor: '#1a0a05',
    })

    setMap(newMap)
    onMapLoad?.(newMap)
  }, [loaded, center, zoom, map, onMapLoad])

  // Update center when props change
  useEffect(() => {
    if (map) {
      map.panTo(center)
    }
  }, [map, center])

  const hasKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE'

  return (
    <div className={`relative ${className}`}>
      {!hasKey ? (
        <div className="w-full h-full bg-[#1a0a05] flex items-center justify-center">
          <div className="text-center text-amber-200/20">
            <p className="text-sm">Map Preview</p>
            <p className="text-xs mt-1">Add Google Maps API key to .env.local</p>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}
    </div>
  )
}
