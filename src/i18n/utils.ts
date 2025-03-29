import { Temporal } from "@js-temporal/polyfill";
import { enUS, de, type Locale } from "react-day-picker/locale";

export function getReactDayPickerLocale(locale: string): Locale {
  let calendarLocale: Locale = enUS;

  switch (locale) {
    case "en":
      calendarLocale = enUS;
      break;
    case "de":
      calendarLocale = de;
      break;
  }

  return calendarLocale;
}

/**
 * @param weekdayNumber 1-7 (1 = Monday, 7 = Sunday)
 */
export function getWeekdayName(weekdayNumber: number, locale: string): string {
  const date = Temporal.PlainDate.from("2024-01-07").add({
    days: weekdayNumber,
  });

  return date.toLocaleString(locale, {
    weekday: "long",
  });
}

/**
 * @param monthNumber 1-12 (1 = January, 12 = December)
 */
export function getMonthName(monthNumber: number, locale: string): string {
  const date = Temporal.PlainDate.from("2024-01-01").add({
    months: monthNumber - 1,
  });

  return date.toLocaleString(locale, {
    month: "long",
  });
}
