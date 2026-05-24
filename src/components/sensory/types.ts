import type { TextureKey, SmellKey } from '@/types/interfaces'

export type { TextureKey, SmellKey }

export interface SensoryProfileData {
  safeFoods: string[]
  avoidedFoods: string[]
  avoidedTextures: TextureKey[]
  avoidedSmells: SmellKey[]
  temperaturePreference: 'warm' | 'cold' | 'room_temp' | 'any'
  repetitionMode: 'low' | 'medium' | 'high'
  foodChaining: boolean
  routineLock: boolean
  interoceptionCheckIns: boolean
}

export const DEFAULT_SENSORY_DATA: SensoryProfileData = {
  safeFoods: [],
  avoidedFoods: [],
  avoidedTextures: [],
  avoidedSmells: [],
  temperaturePreference: 'any',
  repetitionMode: 'medium',
  foodChaining: false,
  routineLock: false,
  interoceptionCheckIns: false,
}
