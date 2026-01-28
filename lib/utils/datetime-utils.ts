/**
 * DateTime Utility Functions
 * Helper functions for handling datetime conversions between different formats
 */

/**
 * Convert datetime-local input value to ISO 8601 datetime string
 * Input: "2025-11-23T19:04" (datetime-local format)
 * Output: "2025-11-23T19:04:00.000Z" (ISO 8601 format)
 */
export function datetimeLocalToISO(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  
  // If already in ISO format, return as is
  if (datetimeLocal.includes("T") && datetimeLocal.includes("Z")) {
    return datetimeLocal;
  }
  
  // Convert datetime-local format to ISO
  // datetime-local: "2025-11-23T19:04"
  // ISO: "2025-11-23T19:04:00.000Z"
  const date = new Date(datetimeLocal);
  
  if (isNaN(date.getTime())) {
    throw new Error("Invalid datetime format");
  }
  
  return date.toISOString();
}

/**
 * Convert ISO 8601 datetime string to datetime-local input value
 * Input: "2025-11-23T19:04:00.000Z" (ISO 8601 format)
 * Output: "2025-11-23T19:04" (datetime-local format)
 */
export function isoToDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "";
    }
    
    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error converting ISO to datetime-local:", error);
    return "";
  }
}

/**
 * Validate that end date is after start date
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    
    return end > start;
  } catch {
    return false;
  }
}

/**
 * Time Display Utilities for News Website
 * All times are displayed in IST (Asia/Kolkata) timezone
 */

/**
 * Get current date formatted for news website header
 * Returns date in Hindi locale format
 */
export function getCurrentDateFormatted(locale: string = "hi-IN"): string {
  return new Date().toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Get current time formatted for news website
 * Returns time in 12-hour format with IST
 */
export function getCurrentTimeFormatted(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }) + " IST";
}

/**
 * Get current date and time combined for news website header
 * Returns formatted string with date and time
 */
export function getCurrentDateTimeFormatted(locale: string = "hi-IN"): string {
  const date = getCurrentDateFormatted(locale);
  const time = getCurrentTimeFormatted();
  return `${date}, ${time}`;
}

/**
 * Format date for news articles
 * Supports various formats: full, short, with time, relative
 */
export function formatNewsDate(
  date: Date | string,
  options: {
    includeTime?: boolean;
    locale?: string;
    format?: "full" | "short" | "relative";
  } = {}
): string {
  const {
    includeTime = false,
    locale = "en-IN",
    format = "short",
  } = options;

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  // Relative time format (e.g., "2 hours ago", "3 days ago")
  if (format === "relative") {
    return getRelativeTime(dateObj);
  }

  // Full format with weekday
  if (format === "full") {
    return dateObj.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      timeZone: "Asia/Kolkata",
    }) + (includeTime ? " IST" : "");
  }

  // Short format (default)
  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    timeZone: "Asia/Kolkata",
  }) + (includeTime ? " IST" : "");
}

/**
 * Get relative time string (e.g., "2 hours ago", "Just now")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  
  // Convert both to IST for accurate comparison
  const dateIST = new Date(
    dateObj.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const nowIST = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  
  const diffMs = nowIST.getTime() - dateIST.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  }
  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
}

/**
 * Get formatted time for live clock display
 * Updates every second - use with React state/effect
 */
export function getLiveTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Get formatted date and time for live display
 * Updates every second - use with React state/effect
 */
export function getLiveDateTime(locale: string = "hi-IN"): string {
  const date = new Date().toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const time = getLiveTime();
  return `${date}, ${time} IST`;
}

