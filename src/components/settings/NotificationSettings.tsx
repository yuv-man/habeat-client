import { useState, useEffect } from "react";
import { Bell, Clock, Flame, Trophy, Zap, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const {
    preferences,
    loading,
    error,
    permissionGranted,
    requestPermission,
    updatePreferences,
  } = useNotifications();

  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Local state for form
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPrefs) return;
    setSaving(true);
    try {
      await updatePreferences(localPrefs);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted && localPrefs) {
      // Enable notifications by default when permission is granted
      setLocalPrefs({ ...localPrefs, enabled: true });
      await updatePreferences({ ...localPrefs, enabled: true });
    }
  };

  if (loading) {
    return (
      <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse", className)}>
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!localPrefs) return null;

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          {!isNative && (
            <span className="text-xs text-gray-400">Web only</span>
          )}
          {isNative && !permissionGranted && (
            <span className="text-xs text-orange-500">Permission needed</span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Permission Request for Native */}
          {isNative && !permissionGranted && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-700 mb-2">
                Enable notifications to get meal reminders and stay on track with your goals.
              </p>
              <Button
                size="sm"
                onClick={handleRequestPermission}
                className="h-7 text-xs bg-orange-500 hover:bg-orange-600"
              >
                Enable Notifications
              </Button>
            </div>
          )}

          {/* Master Toggle */}
          <div className="flex items-center justify-between py-3 mt-2">
            <Label htmlFor="notifications-enabled" className="text-sm font-medium">
              Enable All Notifications
            </Label>
            <Switch
              id="notifications-enabled"
              checked={localPrefs.enabled}
              onCheckedChange={(checked) =>
                setLocalPrefs({ ...localPrefs, enabled: checked })
              }
              disabled={isNative && !permissionGranted}
            />
          </div>

          {localPrefs.enabled && (
            <>
              {/* Meal Reminders */}
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-gray-700">Meal Reminders</span>
                </div>
                <div className="space-y-2 pl-5">
                  {(["breakfast", "lunch", "dinner", "snacks"] as const).map((meal) => (
                    <div key={meal} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`meal-${meal}`}
                          checked={localPrefs.mealReminders[meal].enabled}
                          onCheckedChange={(checked) =>
                            setLocalPrefs({
                              ...localPrefs,
                              mealReminders: {
                                ...localPrefs.mealReminders,
                                [meal]: { ...localPrefs.mealReminders[meal], enabled: checked },
                              },
                            })
                          }
                        />
                        <Label htmlFor={`meal-${meal}`} className="text-xs capitalize">
                          {meal}
                        </Label>
                      </div>
                      <Input
                        type="time"
                        value={localPrefs.mealReminders[meal].time}
                        onChange={(e) =>
                          setLocalPrefs({
                            ...localPrefs,
                            mealReminders: {
                              ...localPrefs.mealReminders,
                              [meal]: { ...localPrefs.mealReminders[meal], time: e.target.value },
                            },
                          })
                        }
                        disabled={!localPrefs.mealReminders[meal].enabled}
                        className="w-24 h-7 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Alerts */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-medium text-gray-700">Streak Alerts</span>
                </div>
                <div className="flex items-center justify-between pl-5">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="streak-alerts"
                      checked={localPrefs.streakAlerts.enabled}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          streakAlerts: { ...localPrefs.streakAlerts, enabled: checked },
                        })
                      }
                    />
                    <Label htmlFor="streak-alerts" className="text-xs">
                      Daily reminder
                    </Label>
                  </div>
                  <Input
                    type="time"
                    value={localPrefs.streakAlerts.warningTime}
                    onChange={(e) =>
                      setLocalPrefs({
                        ...localPrefs,
                        streakAlerts: { ...localPrefs.streakAlerts, warningTime: e.target.value },
                      })
                    }
                    disabled={!localPrefs.streakAlerts.enabled}
                    className="w-24 h-7 text-xs"
                  />
                </div>
              </div>

              {/* Challenge Updates */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-gray-700">Challenge Updates</span>
                </div>
                <div className="space-y-2 pl-5">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="challenge-complete"
                      checked={localPrefs.challengeUpdates.onComplete}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          challengeUpdates: { ...localPrefs.challengeUpdates, onComplete: checked },
                        })
                      }
                    />
                    <Label htmlFor="challenge-complete" className="text-xs">
                      When completed
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="challenge-expiring"
                      checked={localPrefs.challengeUpdates.onExpiring}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          challengeUpdates: { ...localPrefs.challengeUpdates, onExpiring: checked },
                        })
                      }
                    />
                    <Label htmlFor="challenge-expiring" className="text-xs">
                      Before expiring
                    </Label>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-medium text-gray-700">Achievements</span>
                </div>
                <div className="space-y-2 pl-5">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="level-up"
                      checked={localPrefs.achievements.levelUp}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          achievements: { ...localPrefs.achievements, levelUp: checked },
                        })
                      }
                    />
                    <Label htmlFor="level-up" className="text-xs">
                      Level up
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="badge-earned"
                      checked={localPrefs.achievements.badgeEarned}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          achievements: { ...localPrefs.achievements, badgeEarned: checked },
                        })
                      }
                    />
                    <Label htmlFor="badge-earned" className="text-xs">
                      Badge earned
                    </Label>
                  </div>
                </div>
              </div>

              {/* Motivational Nudges */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="motivational"
                      checked={localPrefs.motivationalNudges.enabled}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          motivationalNudges: { ...localPrefs.motivationalNudges, enabled: checked },
                        })
                      }
                    />
                    <Label htmlFor="motivational" className="text-xs">
                      Motivational messages
                    </Label>
                  </div>
                  <Select
                    value={localPrefs.motivationalNudges.frequency}
                    onValueChange={(value: "daily" | "weekly" | "occasional") =>
                      setLocalPrefs({
                        ...localPrefs,
                        motivationalNudges: { ...localPrefs.motivationalNudges, frequency: value },
                      })
                    }
                    disabled={!localPrefs.motivationalNudges.enabled}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="occasional">Sometimes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-medium text-gray-700">Quiet Hours</span>
                </div>
                <div className="pl-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch
                      id="quiet-hours"
                      checked={localPrefs.quietHours.enabled}
                      onCheckedChange={(checked) =>
                        setLocalPrefs({
                          ...localPrefs,
                          quietHours: { ...localPrefs.quietHours, enabled: checked },
                        })
                      }
                    />
                    <Label htmlFor="quiet-hours" className="text-xs">
                      No notifications during
                    </Label>
                  </div>
                  {localPrefs.quietHours.enabled && (
                    <div className="flex items-center gap-2 ml-6">
                      <Input
                        type="time"
                        value={localPrefs.quietHours.start}
                        onChange={(e) =>
                          setLocalPrefs({
                            ...localPrefs,
                            quietHours: { ...localPrefs.quietHours, start: e.target.value },
                          })
                        }
                        className="w-24 h-7 text-xs"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <Input
                        type="time"
                        value={localPrefs.quietHours.end}
                        onChange={(e) =>
                          setLocalPrefs({
                            ...localPrefs,
                            quietHours: { ...localPrefs.quietHours, end: e.target.value },
                          })
                        }
                        className="w-24 h-7 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-600"
                >
                  {saving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </div>
            </>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;
