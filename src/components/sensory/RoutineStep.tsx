import KycLayout from '@/components/kyc/KycLayout'
import { cn } from '@/lib/utils'
import type { SensoryProfileData } from './types'

interface RoutineStepProps {
  data: SensoryProfileData
  setData: React.Dispatch<React.SetStateAction<SensoryProfileData>>
  loading: boolean
  error?: string
  onSubmit: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0',
        checked ? 'bg-green-500' : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

const REPETITION_OPTIONS: { key: SensoryProfileData['repetitionMode']; label: string; desc: string }[] = [
  { key: 'low',    label: 'Mostly the same', desc: 'Same breakfast daily, limited rotation' },
  { key: 'medium', label: 'Some variety',    desc: 'A few familiar meals, some new ones' },
  { key: 'high',   label: 'Lots of variety', desc: 'Different meals every day' },
]

export default function RoutineStep({
  data,
  setData,
  loading,
  error,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: RoutineStepProps) {
  return (
    <KycLayout
      title="Routine & Check-ins"
      description="Control how predictable your week feels."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText="Save Profile"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-5">
        {/* Routine lock */}
        <div className="p-4 rounded-xl bg-white border border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Keep my meal plan predictable</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Locks meal times and warns you when your plan changes significantly
              </p>
            </div>
            <Toggle
              checked={data.routineLock}
              onChange={v => setData(prev => ({ ...prev, routineLock: v }))}
            />
          </div>

          {data.routineLock && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                How much variety do you want?
              </p>
              <div className="space-y-2">
                {REPETITION_OPTIONS.map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setData(prev => ({ ...prev, repetitionMode: key }))}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition text-left',
                      data.repetitionMode === key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 shrink-0',
                        data.repetitionMode === key
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      )}
                    />
                    <div>
                      <p className={cn('text-sm font-medium', data.repetitionMode === key ? 'text-green-700' : 'text-gray-800')}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Food chaining */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Help me try one new food each week</p>
            <p className="text-xs text-gray-500 mt-0.5">
              One meal slot per week will gently introduce a new food near a safe one — always swappable
            </p>
          </div>
          <Toggle
            checked={data.foodChaining}
            onChange={v => setData(prev => ({ ...prev, foodChaining: v }))}
          />
        </div>

        {/* Interoception check-ins */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Remind me to check in with my hunger</p>
            <p className="text-xs text-gray-500 mt-0.5">
              A prompt before each meal and 20 minutes after to help you tune into hunger and fullness
            </p>
          </div>
          <Toggle
            checked={data.interoceptionCheckIns}
            onChange={v => setData(prev => ({ ...prev, interoceptionCheckIns: v }))}
          />
        </div>
      </div>
    </KycLayout>
  )
}
