import { useState } from 'react'
import KycLayout from '@/components/kyc/KycLayout'
import type { SensoryProfileData } from './types'

interface AvoidedFoodsStepProps {
  data: SensoryProfileData
  setData: React.Dispatch<React.SetStateAction<SensoryProfileData>>
  onSubmit: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function AvoidedFoodsStep({
  data,
  setData,
  onSubmit,
  onBack,
  currentStep,
  totalSteps,
}: AvoidedFoodsStepProps) {
  const [input, setInput] = useState('')

  const addFood = () => {
    const trimmed = input.trim()
    if (!trimmed || data.avoidedFoods.includes(trimmed)) return
    setData(prev => ({ ...prev, avoidedFoods: [...prev.avoidedFoods, trimmed] }))
    setInput('')
  }

  const removeFood = (food: string) => {
    setData(prev => ({ ...prev, avoidedFoods: prev.avoidedFoods.filter(f => f !== food) }))
  }

  return (
    <KycLayout
      title="Avoided Foods"
      description="Are there foods you always avoid? Your existing allergies are already included. Add anything else here."
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
            placeholder="e.g. Mushrooms, Spicy food..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFood()}
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-400 text-sm"
          />
          <button
            onClick={addFood}
            className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition text-sm"
          >
            Add
          </button>
        </div>

        {data.avoidedFoods.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.avoidedFoods.map(food => (
              <button
                key={food}
                onClick={() => removeFood(food)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-red-200 transition"
              >
                {food}
                <span className="text-red-400 text-xs">✕</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No avoided foods added yet — skip to leave this empty
          </p>
        )}
      </div>
    </KycLayout>
  )
}
