import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomDropdown } from "./custom-dropdown";

export function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  visibleStart,
  visibleEnd,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = "",
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  visibleStart: number;
  visibleEnd: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <span>
        Showing {visibleStart}-{visibleEnd} of {totalItems}
      </span>
      <div className="flex items-center gap-3">
        <CustomDropdown
          value={String(pageSize)}
          onChange={(value) => onPageSizeChange(Number(value))}
          options={pageSizeOptions.map((option) => ({
            label: `${option} / page`,
            value: String(option),
          }))}
          triggerClassName="h-9 w-32"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="grid size-9 place-items-center rounded-lg border border-border text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-20 text-center">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="grid size-9 place-items-center rounded-lg border border-border text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
