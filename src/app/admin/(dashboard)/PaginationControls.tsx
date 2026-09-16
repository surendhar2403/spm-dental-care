"use client";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Builds the page-number sequence to render, collapsing long runs into a
 * single "…" — e.g. for page 7 of 20: [1, "…", 6, 7, 8, "…", 20]. For 7 or
 * fewer pages, every page number is shown (no ellipsis needed).
 */
function buildPageWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

/**
 * Appointment list pagination — Previous / page numbers / Next. Purely
 * presentational: page.tsx owns `currentPage` and slices the already
 * filtered appointment list before handing a page's worth to
 * AppointmentsTable. Renders nothing when everything fits on one page.
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageWindow(currentPage, totalPages);

  return (
    <nav
      aria-label="Appointments pagination"
      className="flex flex-wrap items-center justify-center gap-1.5 pt-1"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-ink/40">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              page === currentPage
                ? "bg-blue-900 text-canvas"
                : "border border-line text-ink hover:bg-canvas-soft"
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
        className="inline-flex items-center justify-center rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
