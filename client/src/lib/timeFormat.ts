/**
 * Converts 24-hour time format to 12-hour format
 * @param time24 - Time string in 24-hour format (e.g., "08:00-18:00", "8:00-18:00", "08:00", etc.)
 * @returns Time string in 12-hour format (e.g., "8:00 AM-6:00 PM", "8:00 AM", etc.)
 */
export function convertTo12Hour(time24: string): string {
  if (!time24 || time24 === 'Closed') {
    return time24;
  }

  // Handle time ranges (e.g., "08:00-18:00")
  if (time24.includes('-')) {
    const [start, end] = time24.split('-');
    return `${convertSingleTime(start.trim())}-${convertSingleTime(end.trim())}`;
  }

  // Handle single time
  return convertSingleTime(time24);
}

/**
 * Converts a single time from 24-hour to 12-hour format
 * @param time - Time string (e.g., "08:00", "18:00", "8:00")
 * @returns Time in 12-hour format (e.g., "8:00 AM", "6:00 PM")
 */
function convertSingleTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';

  if (isNaN(hour)) {
    return time; // Return original if parsing fails
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert to 12-hour format (0 becomes 12)

  // Remove leading zero from hour
  return `${hour}:${minute}${period}`;
}
