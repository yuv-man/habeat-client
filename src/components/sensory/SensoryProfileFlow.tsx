import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { ISensoryProfile } from '@/types/interfaces'
import { DEFAULT_SENSORY_DATA, type SensoryProfileData } from './types'
import WelcomeStep from './WelcomeStep'
import SafeFoodsStep from './SafeFoodsStep'
import AvoidedFoodsStep from './AvoidedFoodsStep'
import SensoryDetailsStep from './SensoryDetailsStep'
import RoutineStep from './RoutineStep'

type Step = 'welcome' | 'safeFoods' | 'avoidedFoods' | 'sensoryDetails' | 'routine'

const TOTAL_STEPS = 4

function stepNumber(step: Step): number | undefined {
  const map: Partial<Record<Step, number>> = {
    safeFoods: 1,
    avoidedFoods: 2,
    sensoryDetails: 3,
    routine: 4,
  }
  return map[step]
}

export default function SensoryProfileFlow() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [step, setStep] = useState<Step>('welcome')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<SensoryProfileData>(() => {
    const base = { ...DEFAULT_SENSORY_DATA }
    // Pre-populate avoided foods from existing allergies
    if (user?.allergies?.length) {
      base.avoidedFoods = [...user.allergies]
    }
    return base
  })

  const handleBack = () => {
    const prev: Record<Step, Step | null> = {
      welcome: null,
      safeFoods: 'welcome',
      avoidedFoods: 'safeFoods',
      sensoryDetails: 'avoidedFoods',
      routine: 'sensoryDetails',
    }
    const target = prev[step]
    if (target) setStep(target)
    else navigate(-1)
  }

  const handleSave = async () => {
    if (!user?._id) return
    setLoading(true)
    setError('')
    try {
      const sensoryProfile: ISensoryProfile = { enabled: true, ...data }
      await updateProfile(user._id, { sensoryProfile })
      navigate('/settings')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const num = stepNumber(step)

  switch (step) {
    case 'welcome':
      return <WelcomeStep onSubmit={() => setStep('safeFoods')} onBack={handleBack} />

    case 'safeFoods':
      return (
        <SafeFoodsStep
          data={data}
          setData={setData}
          onSubmit={() => setStep('avoidedFoods')}
          onBack={handleBack}
          currentStep={num!}
          totalSteps={TOTAL_STEPS}
        />
      )

    case 'avoidedFoods':
      return (
        <AvoidedFoodsStep
          data={data}
          setData={setData}
          onSubmit={() => setStep('sensoryDetails')}
          onBack={handleBack}
          currentStep={num!}
          totalSteps={TOTAL_STEPS}
        />
      )

    case 'sensoryDetails':
      return (
        <SensoryDetailsStep
          data={data}
          setData={setData}
          onSubmit={() => setStep('routine')}
          onBack={handleBack}
          currentStep={num!}
          totalSteps={TOTAL_STEPS}
        />
      )

    case 'routine':
      return (
        <RoutineStep
          data={data}
          setData={setData}
          loading={loading}
          error={error}
          onSubmit={handleSave}
          onBack={handleBack}
          currentStep={num!}
          totalSteps={TOTAL_STEPS}
        />
      )
  }
}
