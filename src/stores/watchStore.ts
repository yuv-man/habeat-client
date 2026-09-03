import { create } from 'zustand'
import { WatchSnapshot } from '@/services/watch/types'
import {
  initializeWatch,
  grantPermissions,
  denyPermissions,
  refreshPermissions,
  openHealthSettings,
  openHealthStore,
  WatchStatus,
} from '@/services/watch/watchService'

export type { WatchStatus }

interface WatchState {
  snapshot: WatchSnapshot | null
  status: WatchStatus
  showPermissionModal: boolean
  /** Optional data types the user did not grant — some stats will be empty. */
  missingOptional: string[]
  setSnapshot: (snapshot: WatchSnapshot | null) => void
  setStatus: (status: WatchStatus) => void
  setShowPermissionModal: (show: boolean) => void
  setMissingOptional: (missing: string[]) => void
  initialize: () => Promise<void>
  grant: () => Promise<void>
  deny: () => Promise<void>
  /** Re-read platform permissions without prompting. */
  refresh: () => Promise<void>
  /** Open OS health settings, for manual granting after a refusal. */
  openSettings: () => Promise<void>
  /** Android: install Health Connect. */
  openStore: () => Promise<void>
}

export const useWatchStore = create<WatchState>((set, get) => ({
  snapshot: null,
  status: 'idle',
  showPermissionModal: false,
  missingOptional: [],

  setSnapshot: (snapshot) => set({ snapshot }),
  setStatus: (status) => set({ status }),
  setShowPermissionModal: (show) => set({ showPermissionModal: show }),
  setMissingOptional: (missingOptional) => set({ missingOptional }),

  initialize: async () => {
    await initializeWatch(get())
  },

  grant: async () => {
    await grantPermissions(get())
  },

  deny: async () => {
    await denyPermissions(get())
  },

  refresh: async () => {
    await refreshPermissions(get())
  },

  openSettings: async () => {
    await openHealthSettings()
  },

  openStore: async () => {
    await openHealthStore()
  },
}))
