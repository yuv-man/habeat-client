import { useWatchStore } from '@/stores/watchStore'
import { cn } from '@/lib/utils'

export default function WatchStatusBadge() {
  const { snapshot, status } = useWatchStore()

  if (status !== 'granted' || !snapshot) return null

  const highStress = snapshot.stressLevel === 'high' || snapshot.sleepQuality === 'poor'
  const moderateStress = !highStress && snapshot.stressLevel === 'moderate'
  const sleepOnly = !highStress && !moderateStress && snapshot.sleepQuality === 'fair'

  if (!highStress && !moderateStress && !sleepOnly) return null

  const hr = snapshot.heartRate ? ` · ${snapshot.heartRate}bpm` : ''

  const label = highStress
    ? `Elevated stress${hr}`
    : moderateStress
    ? `Moderate stress${hr}`
    : `Low sleep · ${snapshot.sleepHours}h`

  return (
    <div className="px-4 pb-2">
      <span className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
        highStress && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        moderateStress && 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        sleepOnly && 'bg-muted text-muted-foreground',
      )}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {label}
      </span>
    </div>
  )
}
