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

// Notification IDs by type for management
const NOTIFICATION_IDS = {
  breakfast: 1001,
  lunch: 1002,
  dinner: 1003,
  snacks: 1004,
  streakWarning: 2001,
  dailySummary: 3001,
  weeklySummary: 3002,
  motivational: 4001,
  // CBT notification IDs
  moodCheckInMorning: 5001,
  moodCheckInAfternoon: 5002,
  moodCheckInEvening: 5003,
  thoughtPrompt: 5004,
  exerciseReminder: 5005,
  emotionalEatingAlert: 5006,
  cbtStreakWarning: 5007,
};

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

  // Schedule notifications based on preferences
  const scheduleNotificationsFromPreferences = async (
    prefs: INotificationPreferences
  ) => {
    if (!prefs.enabled || !isNative) {
      return;
    }

    const notifications: LocalNotificationSchema[] = [];
    const now = new Date();

    // Helper to get next occurrence of a time
    const getNextTime = (timeStr: string): Date => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (date <= now) {
        date.setDate(date.getDate() + 1);
      }
      return date;
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
          const scheduleAt = getNextTime(mealPref.time);
          notifications.push({
            id: NOTIFICATION_IDS[mealType],
            title: getMealReminderTitle(mealType),
            body: getMealReminderBody(mealType),
            schedule: {
              at: scheduleAt,
              repeats: true,
              every: "day" as any,
            },
          });
        }
      }
    }

    // Streak warning
    if (prefs.streakAlerts.enabled) {
      const scheduleAt = getNextTime(prefs.streakAlerts.warningTime);
      notifications.push({
        id: NOTIFICATION_IDS.streakWarning,
        title: "Don't break your streak!",
        body: "Log a meal today to keep your streak alive",
        schedule: {
          at: scheduleAt,
          repeats: true,
          every: "day" as any,
        },
      });
    }

    // Daily summary
    if (prefs.dailySummary.enabled) {
      const scheduleAt = getNextTime(prefs.dailySummary.time);
      notifications.push({
        id: NOTIFICATION_IDS.dailySummary,
        title: "Daily Summary",
        body: "See how you did today!",
        schedule: {
          at: scheduleAt,
          repeats: true,
          every: "day" as any,
        },
      });
    }

    // CBT Reminders
    if (prefs.cbtReminders?.enabled) {
      // Mood check-in reminders
      if (prefs.cbtReminders.moodCheckIn?.enabled) {
        const frequency = prefs.cbtReminders.moodCheckIn.frequency;

        if (frequency === "morning_evening") {
          // Morning check-in at 9am
          const morningTime = getNextTime("09:00");
          notifications.push({
            id: NOTIFICATION_IDS.moodCheckInMorning,
            title: "Good morning! How are you feeling?",
            body: "Take a moment to check in with your mood",
            schedule: {
              at: morningTime,
              repeats: true,
              every: "day" as any,
            },
          });
          // Evening check-in at 8pm
          const eveningTime = getNextTime("20:00");
          notifications.push({
            id: NOTIFICATION_IDS.moodCheckInEvening,
            title: "Evening check-in",
            body: "How has your mood been today?",
            schedule: {
              at: eveningTime,
              repeats: true,
              every: "day" as any,
            },
          });
        } else if (frequency === "3_times_daily" && prefs.cbtReminders.moodCheckIn.times) {
          const times = prefs.cbtReminders.moodCheckIn.times;
          const moodIds = [
            NOTIFICATION_IDS.moodCheckInMorning,
            NOTIFICATION_IDS.moodCheckInAfternoon,
            NOTIFICATION_IDS.moodCheckInEvening,
          ];
          times.slice(0, 3).forEach((time, index) => {
            const scheduleAt = getNextTime(time);
            notifications.push({
              id: moodIds[index],
              title: "Mood Check-In",
              body: "How are you feeling right now?",
              schedule: {
                at: scheduleAt,
                repeats: true,
                every: "day" as any,
              },
            });
          });
        }
      }

      // Thought prompt
      if (prefs.cbtReminders.thoughtPrompt?.enabled && prefs.cbtReminders.thoughtPrompt.time) {
        const scheduleAt = getNextTime(prefs.cbtReminders.thoughtPrompt.time);
        notifications.push({
          id: NOTIFICATION_IDS.thoughtPrompt,
          title: "Time for reflection",
          body: "Notice any challenging thoughts? Take a moment to examine them",
          schedule: {
            at: scheduleAt,
            repeats: true,
            every: "day" as any,
          },
        });
      }

      // Exercise reminder
      if (prefs.cbtReminders.exerciseReminder?.enabled && prefs.cbtReminders.exerciseReminder.preferredTime) {
        const scheduleAt = getNextTime(prefs.cbtReminders.exerciseReminder.preferredTime);
        notifications.push({
          id: NOTIFICATION_IDS.exerciseReminder,
          title: "CBT Exercise Time",
          body: "A few minutes of mindfulness can make a big difference",
          schedule: {
            at: scheduleAt,
            repeats: true,
            every: "day" as any,
          },
        });
      }
    }

    // Schedule all notifications
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
