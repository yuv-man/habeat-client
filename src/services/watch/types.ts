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

export type HealthPermissionName =
  | 'READ_HEART_RATE'
  | 'READ_RESTING_HEART_RATE'
  | 'READ_HRV'
  | 'READ_SLEEP'
  | 'READ_STEPS'

/**
 * Permissions the connection cannot work without.
 *
 * Kept deliberately small. Both HealthKit and Health Connect let a user grant
 * types individually, so demanding all five meant one declined checkbox — most
 * often HRV, which plenty of devices never record — reported the whole
 * connection as denied. Steps and heart rate are the two the UI leads with and
 * the two every platform exposes.
 */
export const REQUIRED_PERMISSIONS = ['READ_STEPS', 'READ_HEART_RATE'] as const

/**
 * Nice to have. Missing ones simply render as "—" in the card; they never
 * block the connection.
 */
export const OPTIONAL_PERMISSIONS = [
  'READ_RESTING_HEART_RATE',
  'READ_HRV',
  'READ_SLEEP',
] as const

export const ALL_PERMISSIONS: readonly HealthPermissionName[] = [
  ...REQUIRED_PERMISSIONS,
  ...OPTIONAL_PERMISSIONS,
]

export interface WatchPermissionState {
  /** True when every REQUIRED permission is granted. */
  connected: boolean
  /** Granted optional permissions — these decide which stats have data. */
  grantedOptional: HealthPermissionName[]
  /** Optional permissions the user did not grant. Informational only. */
  missingOptional: HealthPermissionName[]
}

/** Turn a platform permission map into our required/optional verdict. */
export function evaluatePermissions(
  granted: Partial<Record<HealthPermissionName, boolean>> | undefined | null,
): WatchPermissionState {
  const map = granted ?? {}
  return {
    connected: REQUIRED_PERMISSIONS.every((p) => map[p] === true),
    grantedOptional: OPTIONAL_PERMISSIONS.filter((p) => map[p] === true),
    missingOptional: OPTIONAL_PERMISSIONS.filter((p) => map[p] !== true),
  }
}

export const DISCONNECTED: WatchPermissionState = {
  connected: false,
  grantedOptional: [],
  missingOptional: [...OPTIONAL_PERMISSIONS],
}

export interface WatchDataProvider {
  isAvailable(): Promise<boolean>
  /** Ask the PLATFORM what is currently granted. Never prompts the user. */
  checkPermissions(): Promise<WatchPermissionState>
  requestPermissions(): Promise<WatchPermissionState>
  getSnapshot(): Promise<WatchSnapshot | null>
  /** Open the OS health settings so the user can grant manually. */
  openSettings(): Promise<void>
  /** Android: open Health Connect in the Play Store. iOS: no-op. */
  openStore(): Promise<void>
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
