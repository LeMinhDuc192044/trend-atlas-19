import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

function normalizeOptionText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  className,
  triggerClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}) {
  const normalizedOptions = Array.from(
    new Map(
      options
        .filter((option) => option.value)
        .map((option) => {
          const label = normalizeOptionText(option.label);
          const value = normalizeOptionText(option.value);
          const dedupeKey = (label || value).toLowerCase();

          return [
            dedupeKey,
            {
              ...option,
              label,
              value,
            },
          ];
        }),
    ).values(),
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-10 rounded-lg border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-brand/30",
          triggerClassName,
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72 rounded-xl border-border bg-surface shadow-xl">
        {normalizedOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            title={option.label}
            className="min-h-9 max-w-[min(34rem,calc(100vw-2rem))] rounded-lg pr-9 text-sm"
          >
            <span className="block truncate">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
