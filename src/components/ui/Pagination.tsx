"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  // Build page numbers to show: always first, last, current ±1, with ellipsis
  const pages: (number | "...")[] = [];
  const delta = 1;
  const range: number[] = [];
  for (
    let i = Math.max(2, page - delta);
    i <= Math.min(totalPages - 1, page + delta);
    i++
  ) {
    range.push(i);
  }
  if (range[0] > 2) pages.push(1, "...");
  else pages.push(1);
  pages.push(...range);
  if (range[range.length - 1] < totalPages - 1) pages.push("...", totalPages);
  else pages.push(totalPages);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <p className="text-[12px] text-slate-400 font-medium">
        Showing <span className="text-slate-600 font-semibold">{start}–{end}</span> of{" "}
        <span className="text-slate-600 font-semibold">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-[13px]">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-[10px] text-[13px] font-semibold transition-colors cursor-pointer",
                page === p
                  ? "bg-[#702bf0] text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
