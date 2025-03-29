import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Temporal } from "@js-temporal/polyfill";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { tzDateToPlainDate, plainDateToTZDate } from "@/lib/date";
import { useState } from "react";
import { TZDate } from "react-day-picker";
import { useLocale, useTranslations } from "next-intl";
import { getReactDayPickerLocale } from "@/i18n/utils";

interface DateEditorProps {
  date: Temporal.PlainDate;
  onDateChange: (date: Temporal.PlainDate) => void;
}

export function DateEditor({ date, onDateChange }: DateEditorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const t = useTranslations("DateEditor");
  const locale = useLocale();

  return (
    <div className="space-y-2">
      <Label>{t("date")}</Label>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left">
            <Calendar className="mr-2 size-4" />
            {date.toLocaleString(locale)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            timeZone="UTC"
            mode="single"
            locale={getReactDayPickerLocale(locale)}
            selected={plainDateToTZDate(Temporal.Now.plainDateISO())}
            onSelect={(date) => {
              if (date) {
                onDateChange(tzDateToPlainDate(new TZDate(date, "UTC")));
                setIsCalendarOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
