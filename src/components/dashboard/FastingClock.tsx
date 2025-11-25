import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface FastingClockProps {
  fastingHours: number;
  fastingStartTime: string; // Format: "HH:MM" (e.g., "20:00")
}

const FastingClock = ({
  fastingHours,
  fastingStartTime,
}: FastingClockProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isFasting, setIsFasting] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [startHours, startMinutes] = fastingStartTime
        .split(":")
        .map(Number);

      // Create today's fasting start time
      const fastingStart = new Date();
      fastingStart.setHours(startHours, startMinutes, 0, 0);

      // Calculate fasting end time
      const fastingEnd = new Date(fastingStart);
      fastingEnd.setHours(fastingEnd.getHours() + fastingHours);

      // If fasting start is in the future today, check if we're in yesterday's fasting window
      if (fastingStart > now) {
        const yesterdayFastingStart = new Date(fastingStart);
        yesterdayFastingStart.setDate(yesterdayFastingStart.getDate() - 1);
        const yesterdayFastingEnd = new Date(yesterdayFastingStart);
        yesterdayFastingEnd.setHours(
          yesterdayFastingEnd.getHours() + fastingHours
        );

        if (now >= yesterdayFastingStart && now < yesterdayFastingEnd) {
          // Currently fasting (yesterday's window)
          setIsFasting(true);
          const remaining = Math.max(
            0,
            Math.floor(
              (yesterdayFastingEnd.getTime() - now.getTime()) / 1000 / 60
            )
          );
          const hours = Math.floor(remaining / 60);
          const minutes = remaining % 60;
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          // Not fasting, show time until next fast
          setIsFasting(false);
          const untilStart = Math.max(
            0,
            Math.floor((fastingStart.getTime() - now.getTime()) / 1000 / 60)
          );
          const hours = Math.floor(untilStart / 60);
          const minutes = untilStart % 60;
          setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
        }
      } else {
        // Check if we're in today's fasting window
        if (now >= fastingStart && now < fastingEnd) {
          // Currently fasting
          setIsFasting(true);
          const remaining = Math.max(
            0,
            Math.floor((fastingEnd.getTime() - now.getTime()) / 1000 / 60)
          );
          const hours = Math.floor(remaining / 60);
          const minutes = remaining % 60;
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else if (now < fastingStart) {
          // Not fasting yet, show time until fast starts
          setIsFasting(false);
          const untilStart = Math.max(
            0,
            Math.floor((fastingStart.getTime() - now.getTime()) / 1000 / 60)
          );
          const hours = Math.floor(untilStart / 60);
          const minutes = untilStart % 60;
          setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
        } else {
          // Past today's window, show time until tomorrow's fast
          setIsFasting(false);
          const tomorrowFastingStart = new Date(fastingStart);
          tomorrowFastingStart.setDate(tomorrowFastingStart.getDate() + 1);
          const untilStart = Math.max(
            0,
            Math.floor(
              (tomorrowFastingStart.getTime() - now.getTime()) / 1000 / 60
            )
          );
          const hours = Math.floor(untilStart / 60);
          const minutes = untilStart % 60;
          setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
        }
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000); // Update every second for accuracy

    return () => clearInterval(interval);
  }, [fastingHours, fastingStartTime]);

  if (!isFasting) {
    return null; // Don't show clock when not fasting
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Fasting in Progress
          </div>
          <div className="text-2xl font-bold text-green-700">
            {timeRemaining}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Time remaining until eating window
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastingClock;
