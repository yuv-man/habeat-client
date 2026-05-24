import KycLayout from '@/components/kyc/KycLayout'
import { Leaf } from 'lucide-react'

interface WelcomeStepProps {
  onSubmit: () => void
  onBack: () => void
}

export default function WelcomeStep({ onSubmit, onBack }: WelcomeStepProps) {
  return (
    <KycLayout
      title="Sensory & Routine Profile"
      onBack={onBack}
      onSubmit={onSubmit}
      loading={false}
      submitText="Let's go"
    >
      <div className="flex flex-col items-center text-center pt-4 pb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Leaf className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Let's personalise your meals
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          This short setup helps Habeat plan meals that actually work for you —
          based on your safe foods, sensory preferences, and how much routine
          you want in your week.
        </p>
        <div className="w-full space-y-3 text-left">
          {[
            { label: 'Safe & avoided foods', desc: 'Foods you always trust, and ones to never suggest' },
            { label: 'Sensory preferences', desc: 'Textures, smells, and temperature that matter to you' },
            { label: 'Routine settings', desc: 'How predictable you want your weekly plan to be' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Everything here is optional and can be changed in Settings at any time.
        </p>
      </div>
    </KycLayout>
  )
}
