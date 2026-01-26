/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Converts a date to a local date string in YYYY-MM-DD format
 * @param dateInput - Date object, ISO string, or YYYY-MM-DD string
 * @returns Date string in YYYY-MM-DD format
 */
export const toLocalDateString = (dateInput: Date | string): string => {
  // If already in YYYY-MM-DD format, return as-is
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  const dateObj =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns a new Date object set to the start of the day (00:00:00.000)
 * @param dateInput - Date object or date string
 * @returns Date object at start of day
 */
export const startOfDay = (dateInput: Date | string): Date => {
  const date =
    typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Returns a new Date object set to the end of the day (23:59:59.999)
 * @param dateInput - Date object or date string
 * @returns Date object at end of day
 */
export const endOfDay = (dateInput: Date | string): Date => {
  const date =
    typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Formats a date for display (e.g., "mon, jun 25")
 * @param dateInput - Date object or date string
 * @returns Formatted date string in lowercase format
 */
export const formatDisplayDate = (dateInput: Date | string): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/**
 * Checks if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if both dates are the same day
 */
export const isSameDay = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  return toLocalDateString(date1) === toLocalDateString(date2);
};

/**
 * Checks if a date is today
 * @param dateInput - Date to check
 * @returns true if the date is today
 */
export const isToday = (dateInput: Date | string): boolean => {
  return isSameDay(dateInput, new Date());
};

/**
 * Checks if a date is in the past (before today)
 * @param dateInput - Date to check
 * @returns true if the date is before today
 */
export const isPast = (dateInput: Date | string): boolean => {
  const date = startOfDay(dateInput);
  const today = startOfDay(new Date());
  return date < today;
};

/**
 * Checks if a date is in the future (after today)
 * @param dateInput - Date to check
 * @returns true if the date is after today
 */
export const isFuture = (dateInput: Date | string): boolean => {
  const date = startOfDay(dateInput);
  const today = startOfDay(new Date());
  return date > today;
};

/**
 * Formats time from 24-hour format to 12-hour format with AM/PM
 * @param time - Time string in HH:MM format
 * @returns Formatted time string (e.g., "8:00 AM")
 */
export const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};
