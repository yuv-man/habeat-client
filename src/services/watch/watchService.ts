import { Capacitor } from '@capacitor/core'
import { HealthKitProvider } from './HealthKitProvider'
import { HealthConnectProvider } from './HealthConnectProvider'
import { WatchDataProvider, WatchPermissionState, WatchSnapshot } from './types'
import { storageGetItem, storageSetItem } from '@/lib/storage'

/**
 * Remembers only whether we have ALREADY ASKED, so the permission modal is not
 * shown on every launch.
 *
 * It deliberately does NOT decide connection status. The old code cached
 * "denied" here and returned early forever, so a user who later granted access
 * in the OS health settings stayed disconnected until they cleared app data.
 * The platform is now the source of truth; this is just modal bookkeeping.
 */
const PREF_KEY = 'watch_permission_decision'

export type WatchStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'needs-setup'

export interface WatchCallbacks {
  setStatus: (s: WatchStatus) => void
  setSnapshot: (snap: WatchSnapshot | null) => void
  setShowPermissionModal: (show: boolean) => void
  setMissingOptional?: (missing: string[]) => void
}

let provider: WatchDataProvider | null = null

function getProvider(): WatchDataProvider | null {
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') return new HealthKitProvider()
  if (platform === 'android') return new HealthConnectProvider()
  return null
}

/**
 * Resolve the provider on demand.
 *
 * `provider` used to be assigned only inside initializeWatch(), so any entry
 * point that ran first — the Connect button in Settings after a hot reload,
 * for instance — hit `if (!provider) return` and did nothing at all, silently.
 */
function ensureProvider(): WatchDataProvider | null {
  if (!provider) provider = getProvider()
  return provider
}

/** Whether this device can do health data at all, and via which provider. */
async function resolveAvailability(): Promise<
  { ok: true; provider: WatchDataProvider } | { ok: false; status: WatchStatus }
> {
  const active = ensureProvider()
  // Web/desktop — nothing to connect to, and nothing the user can install.
  if (!active) return { ok: false, status: 'unavailable' }

  // Native, but the health API is not usable: on Android this almost always
  // means Health Connect is not installed (a separate app below Android 14).
  // That is recoverable, so it is a different status from 'unavailable'.
  if (!(await active.isAvailable())) return { ok: false, status: 'needs-setup' }

  return { ok: true, provider: active }
}

/** Load the snapshot and settle on a final status. */
async function connect(
  active: WatchDataProvider,
  state: WatchPermissionState,
  callbacks: WatchCallbacks,
): Promise<void> {
  callbacks.setMissingOptional?.(state.missingOptional)

  if (!state.connected) {
    callbacks.setStatus('denied')
    return
  }

  callbacks.setStatus('loading')
  callbacks.setSnapshot(await active.getSnapshot())
  callbacks.setStatus('granted')
}

export async function initializeWatch(callbacks: WatchCallbacks): Promise<void> {
  const availability = await resolveAvailability()
  if (!availability.ok) {
    callbacks.setStatus(availability.status)
    return
  }

  // Ask the platform BEFORE consulting our own cache — a permission granted
  // manually in the health settings has to be picked up here.
  const state = await availability.provider.checkPermissions()

  if (state.connected) {
    await connect(availability.provider, state, callbacks)
    return
  }

  callbacks.setMissingOptional?.(state.missingOptional)

  // Not connected. The stored decision only controls whether we prompt again.
  const alreadyAsked = await storageGetItem(PREF_KEY)
  if (alreadyAsked) {
    callbacks.setStatus('denied')
    return
  }

  callbacks.setStatus('idle')
  callbacks.setShowPermissionModal(true)
}

export async function grantPermissions(callbacks: WatchCallbacks): Promise<void> {
  const availability = await resolveAvailability()
  if (!availability.ok) {
    callbacks.setShowPermissionModal(false)
    callbacks.setStatus(availability.status)
    return
  }

  callbacks.setShowPermissionModal(false)
  callbacks.setStatus('loading')

  const state = await availability.provider.requestPermissions()
  // Record that we asked, whatever the answer — never the answer itself.
  await storageSetItem(PREF_KEY, 'asked')
  await connect(availability.provider, state, callbacks)
}

export async function denyPermissions(callbacks: WatchCallbacks): Promise<void> {
  await storageSetItem(PREF_KEY, 'asked')
  callbacks.setShowPermissionModal(false)
  callbacks.setStatus('denied')
}

/**
 * Re-read permissions from the platform without prompting.
 * Use after sending the user to the health settings — they come back to the
 * app and the connection should light up without another tap.
 */
export async function refreshPermissions(callbacks: WatchCallbacks): Promise<void> {
  const availability = await resolveAvailability()
  if (!availability.ok) {
    callbacks.setStatus(availability.status)
    return
  }

  const state = await availability.provider.checkPermissions()
  await connect(availability.provider, state, callbacks)
}

/** Open the OS health settings so permissions can be granted by hand. */
export async function openHealthSettings(): Promise<void> {
  await ensureProvider()?.openSettings()
}

/** Android: send the user to install Health Connect. */
export async function openHealthStore(): Promise<void> {
  await ensureProvider()?.openStore()
}
