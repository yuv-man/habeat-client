import { useState } from 'react'
import KycLayout from '@/components/kyc/KycLayout'
import type { SensoryProfileData } from './types'

interface SafeFoodsStepProps {
  data: SensoryProfileData
  setData: React.Dispatch<React.SetStateAction<SensoryProfileData>>
  onSubmit: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function SafeFoodsStep({
  data,
  setData,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: SafeFoodsStepProps) {
  const [input, setInput] = useState('')

  const addFood = () => {
    const trimmed = input.trim()
    if (!trimmed || data.safeFoods.includes(trimmed)) return
    setData(prev => ({ ...prev, safeFoods: [...prev.safeFoods, trimmed] }))
    setInput('')
  }

  const removeFood = (food: string) => {
    setData(prev => ({ ...prev, safeFoods: prev.safeFoods.filter(f => f !== food) }))
  }

  return (
    <KycLayout
      title="Safe Foods"
      description="What foods do you always feel comfortable eating? These become the priority pool for your meal plans."
      onBack={onBack}
      onSubmit={onSubmit}
      loading={false}
      submitText="Continue"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. White rice, Chicken, Carrots..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFood()}
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
          />
          <button
            onClick={addFood}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition text-sm"
          >
            Add
          </button>
        </div>

        {data.safeFoods.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.safeFoods.map(food => (
              <button
                key={food}
                onClick={() => removeFood(food)}
                className="px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-green-600 transition"
              >
                {food}
                <span className="text-green-200 text-xs">✕</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No safe foods added yet — skip to leave this empty
          </p>
        )}
      </div>
    </KycLayout>
  )
}
