import KycLayout from '@/components/kyc/KycLayout'
import { cn } from '@/lib/utils'
import type { SensoryProfileData, TextureKey, SmellKey } from './types'

interface SensoryDetailsStepProps {
  data: SensoryProfileData
  setData: React.Dispatch<React.SetStateAction<SensoryProfileData>>
  onSubmit: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

const TEXTURES: { key: TextureKey; label: string; example: string }[] = [
  { key: 'mushy',   label: 'Mushy',        example: 'porridge, mashed potato' },
  { key: 'crunchy', label: 'Crunchy / Hard', example: 'crackers, raw carrots' },
  { key: 'chewy',   label: 'Chewy',         example: 'gummy foods, tough meat' },
  { key: 'slimy',   label: 'Slimy / Wet',   example: 'okra, certain sauces' },
  { key: 'grainy',  label: 'Grainy / Seedy', example: 'whole grain bread, seeded rolls' },
  { key: 'gooey',   label: 'Gooey',         example: 'melted cheese, caramel' },
]

const SMELLS: { key: SmellKey; label: string }[] = [
  { key: 'pungent',    label: 'Pungent' },
  { key: 'fermented',  label: 'Fermented' },
  { key: 'spicy',      label: 'Spicy' },
  { key: 'fishy',      label: 'Fishy' },
]

const TEMPS: { key: SensoryProfileData['temperaturePreference']; label: string }[] = [
  { key: 'warm',      label: 'Warm' },
  { key: 'cold',      label: 'Cold' },
  { key: 'room_temp', label: 'Room temp' },
  { key: 'any',       label: 'No preference' },
]

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

export default function SensoryDetailsStep({
  data,
  setData,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: SensoryDetailsStepProps) {
  return (
    <KycLayout
      title="Sensory Details"
      description="Any textures or smells that bother you? Everything here is optional."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={false}
      submitText="Continue"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        {/* Textures */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Textures to avoid
          </h3>
          <div className="space-y-2">
            {TEXTURES.map(({ key, label, example }) => {
              const selected = data.avoidedTextures.includes(key)
              return (
                <button
                  key={key}
                  onClick={() =>
                    setData(prev => ({
                      ...prev,
                      avoidedTextures: toggle(prev.avoidedTextures, key),
                    }))
                  }
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition text-left',
                    selected
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div>
                    <p className={cn('text-sm font-medium', selected ? 'text-orange-700' : 'text-gray-800')}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{example}</p>
                  </div>
                  {selected && (
                    <span className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Smells */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Smells to avoid
          </h3>
          <div className="flex flex-wrap gap-2">
            {SMELLS.map(({ key, label }) => {
              const selected = data.avoidedSmells.includes(key)
              return (
                <button
                  key={key}
                  onClick={() =>
                    setData(prev => ({
                      ...prev,
                      avoidedSmells: toggle(prev.avoidedSmells, key),
                    }))
                  }
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border-2 transition',
                    selected
                      ? 'bg-orange-400 text-white border-orange-400'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Temperature */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Temperature preference
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() =>
                  setData(prev => ({ ...prev, temperaturePreference: key }))
                }
                className={cn(
                  'py-2.5 rounded-xl text-sm font-medium border-2 transition',
                  data.temperaturePreference === key
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </KycLayout>
  )
}
