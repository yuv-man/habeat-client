import { Health } from '@flomentumsolutions/capacitor-health-extended'
import {
  WatchDataProvider,
  WatchSnapshot,
  WatchPermissionState,
  ALL_PERMISSIONS,
  DISCONNECTED,
  evaluatePermissions,
  deriveStressLevel,
  deriveSleepQuality,
} from './types'

export class HealthConnectProvider implements WatchDataProvider {
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await Health.isHealthAvailable()
      return available
    } catch {
      return false
    }
  }

  /**
   * What the platform says right now — no prompt, no cached guess.
   * This is what lets the app notice a permission the user granted manually
   * in the OS health settings after previously declining.
   */
  async checkPermissions(): Promise<WatchPermissionState> {
    try {
      const { permissions } = await Health.checkHealthPermissions({
        permissions: [...ALL_PERMISSIONS],
      })
      return evaluatePermissions(permissions)
    } catch {
      return DISCONNECTED
    }
  }

  async requestPermissions(): Promise<WatchPermissionState> {
    try {
      const { permissions } = await Health.requestHealthPermissions({
        permissions: [...ALL_PERMISSIONS],
      })
      // Partial grants are fine: only the required set decides the verdict.
      return evaluatePermissions(permissions)
    } catch {
      return DISCONNECTED
    }
  }

  async openSettings(): Promise<void> {
    try {
      await Health.openHealthConnectSettings()
    } catch {
      /* nothing else we can do from here */
    }
  }

  /** Health Connect is a separate app on Android 13 and below. */
  async openStore(): Promise<void> {
    try {
      await Health.showHealthConnectInPlayStore()
    } catch {
      /* nothing else we can do from here */
    }
  }

  async getSnapshot(): Promise<WatchSnapshot | null> {
    try {
      const [hr, rhr, hrv, sleep, steps] = await Promise.allSettled([
        Health.queryHeartRate(),
        Health.queryLatestSample({ dataType: 'resting-heart-rate' }),
        Health.queryLatestSample({ dataType: 'hrv' }),
        Health.queryLatestSample({ dataType: 'sleep' }),
        this._getTodaySteps(),
      ])

      const snapshot: WatchSnapshot = { capturedAt: new Date() }

      if (hr.status === 'fulfilled' && hr.value.value !== undefined) {
        snapshot.heartRate = Math.round(hr.value.value)
      }
      if (rhr.status === 'fulfilled' && rhr.value.value !== undefined) {
        snapshot.restingHeartRate = Math.round(rhr.value.value)
      }
      if (hrv.status === 'fulfilled' && hrv.value.value !== undefined) {
        snapshot.hrvScore = hrv.value.value
        snapshot.stressLevel = deriveStressLevel(hrv.value.value)
      }
      if (sleep.status === 'fulfilled' && sleep.value.value !== undefined) {
        const hours = sleep.value.unit === 'h'
          ? sleep.value.value
          : sleep.value.value / 60
        snapshot.sleepHours = Math.round(hours * 10) / 10
        snapshot.sleepQuality = deriveSleepQuality(snapshot.sleepHours)
      }
      if (steps.status === 'fulfilled' && steps.value !== undefined) {
        snapshot.stepCount = Math.round(steps.value)
      }

      return snapshot
    } catch {
      return null
    }
  }

  private async _getTodaySteps(): Promise<number | undefined> {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const result = await Health.queryAggregated({
      dataType: 'steps',
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      bucket: 'day',
    })
    return result.aggregatedData[0]?.value
  }
}
