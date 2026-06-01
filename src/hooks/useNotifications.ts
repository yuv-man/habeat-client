import { useState, useEffect, useCallback } from "react";
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema, PermissionStatus } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { userAPI } from "../services/api";
import { INotificationPreferences, INotificationPayload } from "../types/interfaces";

interface UseNotificationsReturn {
  preferences: INotificationPreferences | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  updatePreferences: (prefs: Partial<INotificationPreferences>) => Promise<void>;
  scheduleNotification: (notification: INotificationPayload, scheduleAt: Date) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  checkAndScheduleMealReminders: () => Promise<void>;
}

// Base IDs for each notification type — each type reserves 7 slots (one per day)
const NOTIFICATION_ID_BASES = {
  breakfast: 1000,
  lunch: 1010,
  dinner: 1020,
  snacks: 1030,
  streakWarning: 2000,
  dailySummary: 3000,
  weeklySummary: 3010,
  motivational: 4000,
  moodCheckInMorning: 5000,
  moodCheckInAfternoon: 5010,
  moodCheckInEvening: 5020,
  thoughtPrompt: 5030,
  exerciseReminder: 5040,
  emotionalEatingAlert: 5050,
  cbtStreakWarning: 5060,
};

const DAYS_TO_SCHEDULE = 7;

export function useNotifications(): UseNotificationsReturn {
  const [preferences, setPreferences] = useState<INotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check if running on native platform
  const isNative = Capacitor.isNativePlatform();

  // Check notification permission status
  const checkPermission = useCallback(async () => {
    if (!isNative) {
      setPermissionGranted(false);
      return false;
    }

    try {
      const result = await LocalNotifications.checkPermissions();
      const granted = result.display === "granted";
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error("Error checking notification permission:", err);
      return false;
    }
  }, [isNative]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      return false;
    }

    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === "granted";
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return false;
    }
  }, [isNative]);

  // Load preferences from server
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getNotificationPreferences();
      setPreferences(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (prefs: Partial<INotificationPreferences>) => {
      try {
        const response = await userAPI.updateNotificationPreferences(prefs);
        setPreferences(response.data);
        setError(null);

        // Reschedule notifications based on new preferences
        if (isNative && permissionGranted) {
          await cancelAllNotifications();
          await scheduleNotificationsFromPreferences(response.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to update notification preferences");
        throw err;
      }
    },
    [isNative, permissionGranted]
  );

  // Schedule a single notification
  const scheduleNotification = useCallback(
    async (notification: INotificationPayload, scheduleAt: Date) => {
      if (!isNative || !permissionGranted) {
        return;
      }

      try {
        const notificationId = Math.floor(Math.random() * 100000);
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notificationId,
              title: notification.title,
              body: notification.body,
              schedule: { at: scheduleAt },
              extra: notification.data,
            },
          ],
        });
      } catch (err) {
        console.error("Error scheduling notification:", err);
      }
    },
    [isNative, permissionGranted]
  );

  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(async () => {
    if (!isNative) {
      return;
    }

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }
    } catch (err) {
      console.error("Error cancelling notifications:", err);
    }
  }, [isNative]);

  // Schedule notifications based on preferences.
  // Schedules DAYS_TO_SCHEDULE individual one-time notifications per type
  // instead of using repeats+every which drifts by the UTC offset each day.
  const scheduleNotificationsFromPreferences = async (
    prefs: INotificationPreferences
  ) => {
    if (!prefs.enabled || !isNative) {
      return;
    }

    const notifications: LocalNotificationSchema[] = [];
    const now = new Date();

    // Returns DAYS_TO_SCHEDULE Date objects for the given "HH:MM" local time,
    // starting from the next occurrence (today if not passed, tomorrow if passed).
    const getDailyDates = (timeStr: string): Date[] => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const base = new Date(now);
      base.setHours(hours, minutes, 0, 0);
      if (base <= now) {
        base.setDate(base.getDate() + 1);
      }
      return Array.from({ length: DAYS_TO_SCHEDULE }, (_, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        return d;
      });
    };

    const pushDailyNotifications = (
      baseId: number,
      title: string,
      body: string,
      timeStr: string
    ) => {
      getDailyDates(timeStr).forEach((fireAt, i) => {
        notifications.push({
          id: baseId + i,
          title,
          body,
          schedule: { at: fireAt },
        });
      });
    };

    // Meal reminders
    if (prefs.mealReminders.enabled) {
      const mealTypes: ("breakfast" | "lunch" | "dinner" | "snacks")[] = [
        "breakfast",
        "lunch",
        "dinner",
        "snacks",
      ];
      for (const mealType of mealTypes) {
        const mealPref = prefs.mealReminders[mealType];
        if (mealPref.enabled) {
          pushDailyNotifications(
            NOTIFICATION_ID_BASES[mealType],
            getMealReminderTitle(mealType),
            getMealReminderBody(mealType),
            mealPref.time
          );
        }
      }
    }

    // Streak warning
    if (prefs.streakAlerts.enabled) {
      pushDailyNotifications(
        NOTIFICATION_ID_BASES.streakWarning,
        "Don't break your streak!",
        "Log a meal today to keep your streak alive",
        prefs.streakAlerts.warningTime
      );
    }

    // Daily summary
    if (prefs.dailySummary.enabled) {
      pushDailyNotifications(
        NOTIFICATION_ID_BASES.dailySummary,
        "Daily Summary",
        "See how you did today!",
        prefs.dailySummary.time
      );
    }

    // CBT Reminders
    if (prefs.cbtReminders?.enabled) {
      if (prefs.cbtReminders.moodCheckIn?.enabled) {
        const frequency = prefs.cbtReminders.moodCheckIn.frequency;

        if (frequency === "morning_evening") {
          pushDailyNotifications(
            NOTIFICATION_ID_BASES.moodCheckInMorning,
            "Good morning! How are you feeling?",
            "Take a moment to check in with your mood",
            "09:00"
          );
          pushDailyNotifications(
            NOTIFICATION_ID_BASES.moodCheckInEvening,
            "Evening check-in",
            "How has your mood been today?",
            "20:00"
          );
        } else if (frequency === "3_times_daily" && prefs.cbtReminders.moodCheckIn.times) {
          const moodBases = [
            NOTIFICATION_ID_BASES.moodCheckInMorning,
            NOTIFICATION_ID_BASES.moodCheckInAfternoon,
            NOTIFICATION_ID_BASES.moodCheckInEvening,
          ];
          prefs.cbtReminders.moodCheckIn.times.slice(0, 3).forEach((time, index) => {
            pushDailyNotifications(
              moodBases[index],
              "Mood Check-In",
              "How are you feeling right now?",
              time
            );
          });
        }
      }

      if (prefs.cbtReminders.thoughtPrompt?.enabled && prefs.cbtReminders.thoughtPrompt.time) {
        pushDailyNotifications(
          NOTIFICATION_ID_BASES.thoughtPrompt,
          "Time for reflection",
          "Notice any challenging thoughts? Take a moment to examine them",
          prefs.cbtReminders.thoughtPrompt.time
        );
      }

      if (prefs.cbtReminders.exerciseReminder?.enabled && prefs.cbtReminders.exerciseReminder.preferredTime) {
        pushDailyNotifications(
          NOTIFICATION_ID_BASES.exerciseReminder,
          "CBT Exercise Time",
          "A few minutes of mindfulness can make a big difference",
          prefs.cbtReminders.exerciseReminder.preferredTime
        );
      }
    }

    if (notifications.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications });
      } catch (err) {
        console.error("Error scheduling notifications:", err);
      }
    }
  };

  // Check and schedule meal reminders (called when app opens)
  const checkAndScheduleMealReminders = useCallback(async () => {
    if (!isNative || !permissionGranted || !preferences?.enabled) {
      return;
    }

    await cancelAllNotifications();
    await scheduleNotificationsFromPreferences(preferences);
  }, [isNative, permissionGranted, preferences, cancelAllNotifications]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      await checkPermission();
      await loadPreferences();
    };
    init();
  }, [checkPermission, loadPreferences]);

  // Set up notification listeners
  useEffect(() => {
    if (!isNative) return;

    const handleNotificationReceived = LocalNotifications.addListener(
      "localNotificationReceived",
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const handleNotificationAction = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        console.log("Notification action:", action);
        // Handle notification tap here
        // Could navigate to specific screen based on notification type
      }
    );

    return () => {
      handleNotificationReceived.then((l) => l.remove());
      handleNotificationAction.then((l) => l.remove());
    };
  }, [isNative]);

  return {
    preferences,
    loading,
    error,
    permissionGranted,
    requestPermission,
    updatePreferences,
    scheduleNotification,
    cancelAllNotifications,
    checkAndScheduleMealReminders,
  };
}

// Helper functions for meal reminder messages
function getMealReminderTitle(mealType: string): string {
  const titles: Record<string, string> = {
    breakfast: "Breakfast time!",
    lunch: "Lunch break!",
    dinner: "Dinner time!",
    snacks: "Snack time!",
  };
  return titles[mealType] || "Time to eat!";
}

function getMealReminderBody(mealType: string): string {
  const bodies: Record<string, string> = {
    breakfast: "Start your day with a nutritious breakfast",
    lunch: "Time to refuel and recharge",
    dinner: "End your day with a balanced meal",
    snacks: "A healthy snack can boost your energy",
  };
  return bodies[mealType] || "Don't forget to log your meal";
}

export default useNotifications;
