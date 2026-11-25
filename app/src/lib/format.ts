/** Italian date and time formatting, always in Europe/Rome. */

const DATE_LONG = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  day: "numeric",
  month: "long",
});

const TIME = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_LONG = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  weekday: "long",
});

const WEEKDAY_SHORT = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  weekday: "short",
});

export function formatDateLong(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const formatted = DATE_LONG.format(value);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateShort(date: Date | string): string {
  return DATE_SHORT.format(typeof date === "string" ? new Date(date) : date);
}

export function formatTime(date: Date | string): string {
  return TIME.format(typeof date === "string" ? new Date(date) : date);
}

export function formatWeekday(date: Date): string {
  return WEEKDAY_LONG.format(date);
}

export function formatWeekdayShort(date: Date): string {
  const formatted = WEEKDAY_SHORT.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(".", "");
}

/** "25 nov 2026 · 15:42" — the dateline used on articles. */
export function formatDateline(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const day = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
  return `${day.replace(".", "")} · ${formatTime(value)}`;
}

/** Reading time from clean text, 200 wpm, minimum 1 minute. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
