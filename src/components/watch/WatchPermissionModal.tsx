import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWatchStore } from '@/stores/watchStore'

export default function WatchPermissionModal() {
  const showPermissionModal = useWatchStore((s) => s.showPermissionModal)
  const grant = useWatchStore((s) => s.grant)
  const deny = useWatchStore((s) => s.deny)

  return (
    <Dialog open={showPermissionModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Connect your health data</DialogTitle>
          <DialogDescription>
            Understand how your body state relates to your eating patterns.
            Heart rate, sleep, and activity data stays on your device and is
            never shared.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={grant} className="w-full">
            Connect
          </Button>
          <Button variant="ghost" onClick={deny} className="w-full text-muted-foreground">
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
