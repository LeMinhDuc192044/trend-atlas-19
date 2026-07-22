import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomDropdown, type DropdownOption } from "./custom-dropdown";

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <span className="sr-only">{label}</span>
      <CustomDropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder={label}
        triggerClassName="pl-10"
      />
    </label>
  );
}
