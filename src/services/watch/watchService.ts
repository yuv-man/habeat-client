import { Capacitor } from '@capacitor/core'
import { HealthKitProvider } from './HealthKitProvider'
import { HealthConnectProvider } from './HealthConnectProvider'
import { WatchDataProvider } from './types'
import { storageGetItem, storageSetItem } from '@/lib/storage'

const PREF_KEY = 'watch_permission_decision'

let provider: WatchDataProvider | null = null

function getProvider(): WatchDataProvider | null {
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') return new HealthKitProvider()
  if (platform === 'android') return new HealthConnectProvider()
  return null
}

export async function initializeWatch(callbacks: {
  setStatus: (s: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable') => void
  setSnapshot: (snap: import('./types').WatchSnapshot | null) => void
  setShowPermissionModal: (show: boolean) => void
}): Promise<void> {
  provider = getProvider()

  if (!provider) {
    callbacks.setStatus('unavailable')
    return
  }

  const available = await provider.isAvailable()
  if (!available) {
    callbacks.setStatus('unavailable')
    return
  }

  const prior = await storageGetItem(PREF_KEY)

  if (prior === 'granted') {
    callbacks.setStatus('loading')
    const snapshot = await provider.getSnapshot()
    callbacks.setSnapshot(snapshot)
    callbacks.setStatus('granted')
    return
  }

  if (prior === 'denied') {
    callbacks.setStatus('denied')
    return
  }

  // First time — show permission modal
  callbacks.setStatus('idle')
  callbacks.setShowPermissionModal(true)
}

export async function grantPermissions(callbacks: {
  setStatus: (s: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable') => void
  setSnapshot: (snap: import('./types').WatchSnapshot | null) => void
  setShowPermissionModal: (show: boolean) => void
}): Promise<void> {
  if (!provider) return
  callbacks.setShowPermissionModal(false)
  callbacks.setStatus('loading')

  const granted = await provider.requestPermissions()
  await storageSetItem(PREF_KEY, granted ? 'granted' : 'denied')

  if (granted) {
    const snapshot = await provider.getSnapshot()
    callbacks.setSnapshot(snapshot)
    callbacks.setStatus('granted')
  } else {
    callbacks.setStatus('denied')
  }
}

export async function denyPermissions(callbacks: {
  setStatus: (s: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable') => void
  setShowPermissionModal: (show: boolean) => void
}): Promise<void> {
  await storageSetItem(PREF_KEY, 'denied')
  callbacks.setShowPermissionModal(false)
  callbacks.setStatus('denied')
}
