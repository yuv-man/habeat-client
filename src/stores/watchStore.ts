import { create } from 'zustand'
import { WatchSnapshot } from '@/services/watch/types'
import { initializeWatch, grantPermissions, denyPermissions } from '@/services/watch/watchService'

type WatchStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

interface WatchState {
  snapshot: WatchSnapshot | null
  status: WatchStatus
  showPermissionModal: boolean
  setSnapshot: (snapshot: WatchSnapshot | null) => void
  setStatus: (status: WatchStatus) => void
  setShowPermissionModal: (show: boolean) => void
  initialize: () => Promise<void>
  grant: () => Promise<void>
  deny: () => Promise<void>
}

export const useWatchStore = create<WatchState>((set, get) => ({
  snapshot: null,
  status: 'idle',
  showPermissionModal: false,

  setSnapshot: (snapshot) => set({ snapshot }),
  setStatus: (status) => set({ status }),
  setShowPermissionModal: (show) => set({ showPermissionModal: show }),

  initialize: async () => {
    const { setStatus, setSnapshot, setShowPermissionModal } = get()
    await initializeWatch({ setStatus, setSnapshot, setShowPermissionModal })
  },

  grant: async () => {
    const { setStatus, setSnapshot, setShowPermissionModal } = get()
    await grantPermissions({ setStatus, setSnapshot, setShowPermissionModal })
  },

  deny: async () => {
    const { setStatus, setShowPermissionModal } = get()
    await denyPermissions({ setStatus, setShowPermissionModal })
  },
}))
