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

interface DateEditorProps {
  date: Temporal.PlainDate;
  onDateChange: (date: Temporal.PlainDate) => void;
}

export function DateEditor({ date, onDateChange }: DateEditorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>Date</Label>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left">
            <Calendar className="mr-2 size-4" />
            {date.toLocaleString()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            timeZone="UTC"
            mode="single"
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
