import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

function generateMockRoute(destinationCount: number, variant: number = 0) {
  const numWaypoints = Math.max(0, destinationCount - 2)
  const order = Array.from({ length: numWaypoints }, (_, i) => i)

  const legs = Array.from({ length: Math.max(1, destinationCount - 1) }, (_, i) => {
    // Vary durations/distances based on variant so mock alternates look different
    const baseDuration = 600 + Math.floor(Math.random() * 1200) + variant * 300
    const baseMiles = 3 + Math.floor(Math.random() * 15) + variant * 2
    return {
      distance: `${baseMiles} mi`,
      duration: `${Math.round(baseDuration / 60)} mins`,
      durationValue: baseDuration,
      startAddress: `Stop ${i + 1}`,
      endAddress: `Stop ${i + 2}`,
    }
  })

  const totalDurationValue = legs.reduce((sum, leg) => sum + leg.durationValue, 0)
  const totalMiles = legs.reduce((sum, leg) => {
    const miles = parseFloat(leg.distance.replace(/[^0-9.]/g, ''))
    return sum + (isNaN(miles) ? 0 : miles)
  }, 0)

  return {
    polyline: '',
    legs,
    totalDistance: `${totalMiles.toFixed(1)} mi`,
    totalDuration: `${Math.round(totalDurationValue / 60)} min`,
    totalDurationValue,
    waypointOrder: order,
  }
}

type ParsedRoute = {
  polyline: string
  legs: { distance: string; duration: string; durationValue: number; startAddress: string; endAddress: string }[]
  totalDistance: string
  totalDuration: string
  totalDurationValue: number
  waypointOrder: number[]
}

// Parse a single Google route object into our RouteData format
function parseGoogleRoute(routeData: {
  overview_polyline: { points: string }
  legs: {
    distance: { text: string }
    duration: { text: string; value: number }
    start_address: string
    end_address: string
  }[]
  waypoint_order?: number[]
}) {
  const legs = routeData.legs.map((leg) => ({
    distance: leg.distance.text,
    duration: leg.duration.text,
    durationValue: leg.duration.value,
    startAddress: leg.start_address,
    endAddress: leg.end_address,
  }))

  const totalDurationValue = legs.reduce((sum, leg) => sum + leg.durationValue, 0)

  return {
    polyline: routeData.overview_polyline.points,
    legs,
    totalDistance:
      legs
        .reduce((sum, leg) => {
          const miles = parseFloat(leg.distance.replace(/[^0-9.]/g, ''))
          return sum + (isNaN(miles) ? 0 : miles)
        }, 0)
        .toFixed(1) + ' mi',
    totalDuration: Math.round(totalDurationValue / 60) + ' min',
    totalDurationValue,
    waypointOrder: routeData.waypoint_order || [],
  }
}

// Resolve a place name to a real address using Google Places Text Search
async function resolvePlace(
  query: string,
  userLat?: number,
  userLng?: number
): Promise<{ address: string; lat: number; lng: number } | null> {
  if (!GOOGLE_KEY) return null

  const params = new URLSearchParams({
    query,
    key: GOOGLE_KEY,
  })

  if (userLat && userLng) {
    params.set('location', `${userLat},${userLng}`)
    params.set('radius', '50000')
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
    )
    const data = await response.json()

    if (data.status === 'OK' && data.results?.length > 0) {
      const place = data.results[0]
      return {
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }
    }
  } catch (err) {
    console.warn('Place resolution failed for:', query, err)
  }

  return null
}

// Fetch directions from Google with given parameters, return all routes
async function fetchDirections(
  origin: string,
  destination: string,
  waypoints: string[],
  filters?: Record<string, boolean>,
  extraAvoid?: string[]
) {
  if (!GOOGLE_KEY) return null

  const params = new URLSearchParams({
    origin,
    destination,
    key: GOOGLE_KEY,
    alternatives: 'true',
  })

  if (waypoints.length > 0) {
    params.set('waypoints', `optimize:true|${waypoints.join('|')}`)
  }

  const avoid: string[] = [...(extraAvoid || [])]
  if (filters?.avoidTolls) avoid.push('tolls')
  if (filters?.avoidHighways) avoid.push('highways')
  if (avoid.length > 0) {
    params.set('avoid', [...new Set(avoid)].join('|'))
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
  )
  return response.json()
}

export async function POST(request: NextRequest) {
  let body: {
    destinations?: { address?: string; name: string; lat?: number; lng?: number }[]
    filters?: Record<string, boolean>
    alternate?: boolean
    excludePolylines?: string[]
    userLat?: number
    userLng?: number
  }

  try {
    body = await request.json()
  } catch {
    // Return mock routes including alternates
    const route = generateMockRoute(3, 0)
    const alternateRoutes = [generateMockRoute(3, 1), generateMockRoute(3, 2)]
    return NextResponse.json({ route, alternateRoutes })
  }

  const { destinations, filters, alternate, excludePolylines, userLat, userLng } = body

  if (!destinations || destinations.length < 2) {
    return NextResponse.json(
      { error: 'Need at least 2 destinations' },
      { status: 400 }
    )
  }

  const hasRealKey = GOOGLE_KEY && GOOGLE_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE'

  if (!hasRealKey) {
    // Return mock routes with alternates
    const route = generateMockRoute(destinations.length, 0)
    const alternateRoutes = [
      generateMockRoute(destinations.length, 1),
      generateMockRoute(destinations.length, 2),
    ]
    return NextResponse.json({ route, alternateRoutes })
  }

  try {
    // Step 1: Resolve each destination to a real address
    const resolvedDestinations = await Promise.all(
      destinations.map(async (d) => {
        if (d.lat && d.lng) {
          return { address: d.address || d.name, lat: d.lat, lng: d.lng }
        }
        const resolved = await resolvePlace(d.address || d.name, userLat, userLng)
        if (resolved) return resolved
        return { address: d.address || d.name, lat: 0, lng: 0 }
      })
    )

    const origin = resolvedDestinations[0].address
    const destination = resolvedDestinations[resolvedDestinations.length - 1].address
    const waypoints = resolvedDestinations.slice(1, -1).map((d) => d.address)

    // Step 2: Fetch routes with alternatives=true
    const data = await fetchDirections(origin, destination, waypoints, filters)

    if (!data || data.status !== 'OK') {
      console.warn('Directions API status:', data?.status, data?.error_message || '')
      const route = generateMockRoute(destinations.length)
      return NextResponse.json({
        route,
        alternateRoutes: [],
        resolvedDestinations: resolvedDestinations.map((d) => ({
          address: d.address, lat: d.lat, lng: d.lng,
        })),
      })
    }

    // Parse ALL routes returned by Google
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allRoutes: ParsedRoute[] = data.routes.map((r: any) => parseGoogleRoute(r))

    // If this is a remap request, try to find routes we haven't shown yet
    if (alternate && excludePolylines && excludePolylines.length > 0) {
      // Filter out routes whose polyline we've already shown
      const newRoutes = allRoutes.filter(
        (r: ParsedRoute) => !excludePolylines.includes(r.polyline)
      )

      if (newRoutes.length > 0) {
        // Return the first genuinely new route
        return NextResponse.json({
          route: newRoutes[0],
          resolvedDestinations: resolvedDestinations.map((d) => ({
            address: d.address, lat: d.lat, lng: d.lng,
          })),
        })
      }

      // No new routes from the default request — try with avoidHighways toggled
      const currentlyAvoidingHighways = filters?.avoidHighways
      const retryData = await fetchDirections(
        origin, destination, waypoints, filters,
        currentlyAvoidingHighways ? [] : ['highways']
      )

      if (retryData && retryData.status === 'OK') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryRoutes: ParsedRoute[] = retryData.routes.map((r: any) => parseGoogleRoute(r))
        const retryNew = retryRoutes.filter(
          (r: ParsedRoute) => !excludePolylines.includes(r.polyline)
        )
        if (retryNew.length > 0) {
          return NextResponse.json({
            route: retryNew[0],
            resolvedDestinations: resolvedDestinations.map((d) => ({
              address: d.address, lat: d.lat, lng: d.lng,
            })),
          })
        }
      }

      // Also try with avoidTolls toggled
      const retryData2 = await fetchDirections(
        origin, destination, waypoints, filters,
        ['tolls']
      )
      if (retryData2 && retryData2.status === 'OK') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryRoutes2: ParsedRoute[] = retryData2.routes.map((r: any) => parseGoogleRoute(r))
        const retryNew2 = retryRoutes2.filter(
          (r: ParsedRoute) => !excludePolylines.includes(r.polyline)
        )
        if (retryNew2.length > 0) {
          return NextResponse.json({
            route: retryNew2[0],
            resolvedDestinations: resolvedDestinations.map((d) => ({
              address: d.address, lat: d.lat, lng: d.lng,
            })),
          })
        }
      }

      // Truly no more alternatives — return the best one we already have
      return NextResponse.json({
        route: allRoutes[allRoutes.length > 1 ? 1 : 0],
        resolvedDestinations: resolvedDestinations.map((d) => ({
          address: d.address, lat: d.lat, lng: d.lng,
        })),
      })
    }

    // Initial request: return primary route + all alternatives
    const primaryRoute = allRoutes[0]
    const alternateRoutes = allRoutes.slice(1)

    return NextResponse.json({
      route: primaryRoute,
      alternateRoutes,
      resolvedDestinations: resolvedDestinations.map((d) => ({
        address: d.address, lat: d.lat, lng: d.lng,
      })),
    })
  } catch (error) {
    console.error('Optimize route error:', error)
    const route = generateMockRoute(destinations.length)
    return NextResponse.json({ route, alternateRoutes: [] })
  }
}
