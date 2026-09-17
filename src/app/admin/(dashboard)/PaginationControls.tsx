"use client";

import { useEffect, useRef, useState } from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: 5 | 10 | 20 | 50) => void;
}

function buildPageWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

function RowsPerPageDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: 5 | 10 | 20 | 50) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options: Array<5 | 10 | 20 | 50> = [5, 10, 20, 50];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-label="Rows per page"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-9 min-w-14 items-center justify-between gap-2 rounded-lg border border-line bg-[var(--admin-surface)] px-2.5 text-xs font-semibold text-[var(--admin-text)] shadow-sm transition-colors hover:border-[var(--admin-link)] hover:bg-[var(--admin-surface-strong)] focus:border-[var(--admin-link)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-link)]/20"
      >
        <span>{value}</span>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 text-[var(--admin-text-soft)] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
        </svg>
      </button>
      <div
        role="listbox"
        aria-label="Rows per page options"
        className={`absolute right-0 bottom-[calc(100%+0.4rem)] z-50 min-w-full rounded-lg border border-line bg-[var(--admin-surface-strong)] p-1 shadow-lg transition-all duration-150 ${isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-1 opacity-0"}`}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={option === value}
            onClick={() => {
              onChange(option);
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-[var(--admin-row-hover-bg)] ${option === value ? "bg-[var(--admin-status-selected-bg)] font-semibold text-[var(--admin-status-selected-text)]" : "text-[var(--admin-text)]"}`}
          >
            {option}
            {option === value ? <span aria-hidden="true">✓</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="admin-appointments-pagination flex w-full flex-wrap items-center justify-between gap-3 pt-1">
      <p className="text-xs text-ink/60">
        Showing {firstItem} to {lastItem} of {totalItems} appointments
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="flex items-center gap-1.5 text-xs text-ink/60">
          <span>Rows per page:</span>
          <RowsPerPageDropdown value={pageSize} onChange={onPageSizeChange} />
        </label>
        {totalPages > 1 ? (
          <nav aria-label="Appointments pagination" className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt;
            </button>
            {buildPageWindow(currentPage, totalPages).map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-ink/40">…</span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                    page === currentPage ? "bg-blue-900 text-canvas" : "border border-line text-ink hover:bg-canvas-soft"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              &gt;
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
