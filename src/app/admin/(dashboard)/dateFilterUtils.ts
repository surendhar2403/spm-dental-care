/**
 * Date-filter helpers for the admin dashboard. Kept separate from the
 * component files so the filtering logic is easy to reason about and test
 * in isolation. All dates are handled as "YYYY-MM-DD" local-calendar
 * strings (matching `appointments.preferred_date`), never as UTC, so
 * "Today" always means today in the browser's local timezone.
 */

export type DateFilterMode = "all" | "today" | "tomorrow" | "week" | "custom";

export const DATE_FILTER_OPTIONS: Array<{ value: DateFilterMode; label: string }> = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
  { value: "custom", label: "Custom Date" },
];

/** Today's date as a local "YYYY-MM-DD" string (not UTC). */
export function getLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a "YYYY-MM-DD" string into its numeric [year, month, day] parts.
 * Every caller in this file only ever passes a well-formed ISO date (from
 * `getLocalISODate` or a `<input type="date">` value), so this never
 * actually throws in practice — the guard exists purely to give TypeScript
 * a definite `number` for each part instead of `number | undefined`.
 */
function parseIsoDateParts(isoDate: string): [year: number, month: number, day: number] {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid ISO date string: "${isoDate}"`);
  }
  return [year, month, day];
}

/** Adds `days` (can be negative) to a "YYYY-MM-DD" string, in local time. */
export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = parseIsoDateParts(isoDate);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getLocalISODate(date);
}

/**
 * "This Week" = from today through the end of the current calendar week
 * (Saturday). Days earlier in the week than today are intentionally
 * excluded — an admin looking at "This Week" wants what's still coming up,
 * not appointments that have already passed.
 */
export function getThisWeekRange(todayIso: string): { start: string; end: string } {
  const [year, month, day] = parseIsoDateParts(todayIso);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sunday ... 6 = Saturday
  const daysUntilSaturday = 6 - dayOfWeek;
  return { start: todayIso, end: addDays(todayIso, daysUntilSaturday) };
}

export function matchesDateFilter(
  preferredDate: string,
  mode: DateFilterMode,
  customDate: string,
  todayIso: string,
): boolean {
  switch (mode) {
    case "all":
      return true;
    case "today":
      return preferredDate === todayIso;
    case "tomorrow":
      return preferredDate === addDays(todayIso, 1);
    case "week": {
      const { start, end } = getThisWeekRange(todayIso);
      return preferredDate >= start && preferredDate <= end;
    }
    case "custom":
      return customDate ? preferredDate === customDate : true;
    default:
      return true;
  }
}
