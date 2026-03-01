import type { Destination } from '@/types'

export async function parseTripInput(text: string): Promise<Destination[]> {
  const response = await fetch('/api/parse-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error('Failed to parse trip input')
  }

  const data = await response.json()
  return data.destinations
}
