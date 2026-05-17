export interface WatchSnapshot {
  heartRate?: number
  restingHeartRate?: number
  hrvScore?: number
  stressLevel?: 'low' | 'moderate' | 'high'
  sleepHours?: number
  sleepQuality?: 'poor' | 'fair' | 'good'
  stepCount?: number
  capturedAt: Date
}

export interface WatchDataProvider {
  isAvailable(): Promise<boolean>
  requestPermissions(): Promise<boolean>
  getSnapshot(): Promise<WatchSnapshot | null>
}

export function deriveStressLevel(hrv: number): 'low' | 'moderate' | 'high' {
  if (hrv < 20) return 'high'
  if (hrv <= 50) return 'moderate'
  return 'low'
}

export function deriveSleepQuality(hours: number): 'poor' | 'fair' | 'good' {
  if (hours < 6) return 'poor'
  if (hours <= 7) return 'fair'
  return 'good'
}
