import { Health } from '@flomentumsolutions/capacitor-health-extended'
import { WatchDataProvider, WatchSnapshot, deriveStressLevel, deriveSleepQuality } from './types'

const PERMISSIONS = [
  'READ_HEART_RATE',
  'READ_RESTING_HEART_RATE',
  'READ_HRV',
  'READ_SLEEP',
  'READ_STEPS',
] as const

export class HealthConnectProvider implements WatchDataProvider {
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await Health.isHealthAvailable()
      return available
    } catch {
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      await Health.requestHealthPermissions({ permissions: [...PERMISSIONS] })
      return true
    } catch {
      return false
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
