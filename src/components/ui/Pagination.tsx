import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const pages = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 dots

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), -1, totalPages];
    }
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [1, -1, ...range(totalPages - rightItemCount + 1, totalPages)];
    }
    return [1, -1, ...range(leftSiblingIndex, rightSiblingIndex), -2, totalPages];
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  const buttonBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300] focus-visible:ring-offset-2';

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center gap-1', className)}
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          buttonBase,
          'text-muted hover:text-[#262B32] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10',
          currentPage === 1 && 'opacity-40 cursor-not-allowed'
        )}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {pages.map((page, idx) => {
        if (page < 0) {
          return (
            <span
              key={`dots-${idx}`}
              className="inline-flex items-center justify-center w-9 h-9 text-muted"
              aria-hidden="true"
            >
              <MoreHorizontal size={16} />
            </span>
          );
        }
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              buttonBase,
              isActive
                ? 'bg-[#FFD300] text-[#090C11] font-semibold'
                : 'text-muted hover:text-[#262B32] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          buttonBase,
          'text-muted hover:text-[#262B32] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10',
          currentPage === totalPages && 'opacity-40 cursor-not-allowed'
        )}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
