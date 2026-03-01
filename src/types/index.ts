export type Item = {
  name: string
  aisle?: string
  storeHasWebsite: boolean
}

export type Destination = {
  id: string
  name: string
  address: string
  placeId?: string
  purpose: string
  items: Item[]
  estimatedTaskTime: number // minutes at this location
  order: number
  lat?: number
  lng?: number
}

export type RouteLeg = {
  distance: string
  duration: string
  durationValue: number // seconds
  startAddress: string
  endAddress: string
}

export type RouteData = {
  polyline: string // encoded polyline
  legs: RouteLeg[]
  totalDistance: string
  totalDuration: string
  totalDurationValue: number // seconds
  waypointOrder: number[]
}

export type TripMode = 'task' | 'journey'

export type FilterState = {
  scenicRoute: boolean
  suggestStops: boolean
  avoidTolls: boolean
  avoidHighways: boolean
  foodHotspots: boolean
}

export type Trip = {
  id: string
  name: string
  mode: TripMode
  destinations: Destination[]
  route: RouteData | null
  alternateRoutes: RouteData[]
  filters: FilterState
  totalEstimatedTime: number // minutes (driving + task time)
  createdAt: string
}

export type HotspotSuggestion = {
  name: string
  rating: number
  address: string
  placeId: string
  type: 'attraction' | 'food'
  lat: number
  lng: number
  detourTime?: string // e.g. "+5 min"
}
