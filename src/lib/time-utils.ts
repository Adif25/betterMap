export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

export function calculateTripTimes(
  totalDrivingSeconds: number,
  totalTaskMinutes: number
) {
  const now = new Date()
  const drivingMinutes = totalDrivingSeconds / 60
  const totalMinutes = drivingMinutes + totalTaskMinutes
  const finishTime = addMinutes(now, totalMinutes)

  return {
    startTime: formatTime(now),
    finishTime: formatTime(finishTime),
    totalDuration: formatDuration(totalMinutes),
    drivingDuration: formatDuration(drivingMinutes),
  }
}
