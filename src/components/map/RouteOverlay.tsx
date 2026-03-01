'use client'

import { useEffect, useRef } from 'react'
import { ROUTE_COLOR, ROUTE_COLOR_ALT, decodePolyline } from '@/lib/google-maps'
import type { RouteData } from '@/types'

type RouteOverlayProps = {
  map: google.maps.Map | null
  route: RouteData | null
  alternateRoutes?: RouteData[]
  activeRouteIndex?: number
  destinations?: { name: string; lat?: number; lng?: number; order: number }[]
}

export default function RouteOverlay({
  map,
  route,
  alternateRoutes = [],
  activeRouteIndex = 0,
  destinations = [],
}: RouteOverlayProps) {
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    if (!map) return

    // Clear existing overlays
    polylinesRef.current.forEach((p) => p.setMap(null))
    markersRef.current.forEach((m) => m.setMap(null))
    polylinesRef.current = []
    markersRef.current = []

    // Draw alternate routes (faded)
    alternateRoutes.forEach((altRoute, i) => {
      if (i + 1 === activeRouteIndex) return // Skip the active one
      const path = decodePolyline(altRoute.polyline)
      const polyline = new google.maps.Polyline({
        path,
        strokeColor: ROUTE_COLOR_ALT,
        strokeOpacity: 0.3,
        strokeWeight: 4,
        map,
      })
      polylinesRef.current.push(polyline)
    })

    // Draw active route
    const activeRoute = activeRouteIndex === 0 ? route : alternateRoutes[activeRouteIndex - 1]
    if (activeRoute) {
      const path = decodePolyline(activeRoute.polyline)

      // Glow effect
      const glow = new google.maps.Polyline({
        path,
        strokeColor: ROUTE_COLOR,
        strokeOpacity: 0.2,
        strokeWeight: 10,
        map,
      })
      polylinesRef.current.push(glow)

      // Main line
      const mainLine = new google.maps.Polyline({
        path,
        strokeColor: ROUTE_COLOR,
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      })
      polylinesRef.current.push(mainLine)

      // Fit bounds
      const bounds = new google.maps.LatLngBounds()
      path.forEach((p) => bounds.extend(p))
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
    }

    // Draw destination markers
    destinations.forEach((dest) => {
      if (dest.lat && dest.lng) {
        const marker = new google.maps.Marker({
          position: { lat: dest.lat, lng: dest.lng },
          map,
          label: {
            text: String(dest.order + 1),
            color: '#fef3c7',
            fontSize: '12px',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: ROUTE_COLOR,
            fillOpacity: 1,
            strokeColor: '#fef3c7',
            strokeWeight: 2,
            scale: 14,
          },
          title: dest.name,
        })
        markersRef.current.push(marker)
      }
    })

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      markersRef.current.forEach((m) => m.setMap(null))
    }
  }, [map, route, alternateRoutes, activeRouteIndex, destinations])

  return null
}
