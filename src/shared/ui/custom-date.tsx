import { useMemo, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const pickerFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function DateDisplay({
  value,
  withTime = false,
  fallback = "-",
  className,
}: {
  value?: string | Date | null;
  withTime?: boolean;
  fallback?: string;
  className?: string;
}) {
  if (!value) return <span className={className}>{fallback}</span>;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return <span className={className}>{fallback}</span>;

  return (
    <time dateTime={date.toISOString()} className={className}>
      {withTime ? dateTimeFormatter.format(date) : dateFormatter.format(date)}
    </time>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);

  const selectDate = (date?: Date) => {
    if (!date) return;
    onChange(toDateValue(date));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-left text-sm outline-none transition hover:bg-secondary/50 focus:ring-2 focus:ring-brand/30",
            !selectedDate && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedDate ? pickerFormatter.format(selectedDate) : (placeholder ?? "Select date")}</span>
          </span>
          {selectedDate ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }
              }}
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-2xl border-border bg-surface p-0 shadow-xl">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">{placeholder ?? "Select date"}</p>
          <p className="text-xs text-muted-foreground">
            {selectedDate ? pickerFormatter.format(selectedDate) : "No date selected"}
          </p>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={selectDate}
          captionLayout="dropdown"
          className="bg-surface"
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-3">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => selectDate(new Date())}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const DateInput = DatePicker;

function parseDateValue(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
