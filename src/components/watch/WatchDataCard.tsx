import { Card, CardContent } from '@/components/ui/card'
import { useWatchStore } from '@/stores/watchStore'
import { WatchSnapshot } from '@/services/watch/types'
import { cn } from '@/lib/utils'

function StatCell({ label, value, flagged }: { label: string; value: string; flagged?: 'amber' | 'red' }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn(
        'text-lg font-bold tabular-nums',
        flagged === 'red' && 'text-destructive',
        flagged === 'amber' && 'text-yellow-500',
        !flagged && 'text-muted-foreground'
      )}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  )
}

function hrFlag(s: WatchSnapshot): 'amber' | 'red' | undefined {
  if (s.heartRate === undefined) return undefined
  if (s.heartRate > 100) return 'red'
  if (s.restingHeartRate !== undefined && s.heartRate > s.restingHeartRate * 1.15) return 'amber'
  return undefined
}

function hrvFlag(s: WatchSnapshot): 'amber' | 'red' | undefined {
  if (s.stressLevel === 'high') return 'red'
  if (s.stressLevel === 'moderate') return 'amber'
  return undefined
}

function sleepFlag(s: WatchSnapshot): 'amber' | 'red' | undefined {
  if (s.sleepQuality === 'poor') return 'red'
  if (s.sleepQuality === 'fair') return 'amber'
  return undefined
}

function stepsFlag(s: WatchSnapshot): 'amber' | undefined {
  if (s.stepCount !== undefined && s.stepCount < 3000) return 'amber'
  return undefined
}

function formatSteps(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function WatchDataCard() {
  const { snapshot, status } = useWatchStore()

  if (status !== 'granted' || !snapshot) return null

  return (
    <Card className="mb-4">
      <CardContent className="pt-4 pb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Your body right now
        </p>
        <div className="flex justify-around">
          <StatCell
            label="Heart rate"
            value={snapshot.heartRate !== undefined ? `${snapshot.heartRate} bpm` : '—'}
            flagged={hrFlag(snapshot)}
          />
          <StatCell
            label="HRV"
            value={snapshot.stressLevel ? { low: 'Normal', moderate: 'Low', high: 'Very low' }[snapshot.stressLevel] : '—'}
            flagged={hrvFlag(snapshot)}
          />
          <StatCell
            label="Sleep"
            value={snapshot.sleepHours !== undefined ? `${snapshot.sleepHours}h` : '—'}
            flagged={sleepFlag(snapshot)}
          />
          <StatCell
            label="Steps"
            value={snapshot.stepCount !== undefined ? formatSteps(snapshot.stepCount) : '—'}
            flagged={stepsFlag(snapshot)}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 text-center">
          These signals are factored into your mindful eating score today.
        </p>
      </CardContent>
    </Card>
  )
}
