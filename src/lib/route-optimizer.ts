import type { RouteData, FilterState } from '@/types'
import { useLocationStore } from '@/store/locationStore'

type ResolvedDestination = {
  address: string
  lat: number
  lng: number
}

type OptimizeResult = {
  route: RouteData
  alternateRoutes?: RouteData[]
  resolvedDestinations?: ResolvedDestination[]
}

export async function optimizeRoute(
  destinations: { address: string; lat?: number; lng?: number }[],
  filters: FilterState
): Promise<OptimizeResult> {
  const userLocation = useLocationStore.getState().userLocation

  const response = await fetch('/api/optimize-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destinations,
      filters,
      userLat: userLocation?.lat,
      userLng: userLocation?.lng,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to optimize route')
  }

  const data = await response.json()
  return {
    route: data.route,
    alternateRoutes: data.alternateRoutes || [],
    resolvedDestinations: data.resolvedDestinations,
  }
}

export async function getAlternateRoute(
  destinations: { address: string; lat?: number; lng?: number }[],
  filters: FilterState,
  excludePolylines: string[]
): Promise<RouteData> {
  const userLocation = useLocationStore.getState().userLocation

  const response = await fetch('/api/optimize-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destinations,
      filters,
      excludePolylines,
      alternate: true,
      userLat: userLocation?.lat,
      userLng: userLocation?.lng,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get alternate route')
  }

  const data = await response.json()
  return data.route
}
