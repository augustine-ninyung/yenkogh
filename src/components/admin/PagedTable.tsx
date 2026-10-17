import React, { useRef } from 'react';
import { scrollToStart } from '@/utils/scroll';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Database column to sort by; omit for columns that cannot be sorted */
  sortColumn?: string;
  /** Applied to the header and every cell, e.g. to hide the column on small screens */
  className?: string;
}

export interface TableFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface ListState<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (value: string) => void;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  sort?: { column: string; ascending: boolean };
  toggleSort: (column: string) => void;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  hasFilters: boolean;
}

interface PagedTableProps<T> {
  list: ListState<T>;
  columns: TableColumn<T>[];
  rowKey: (row: T) => string | number;
  filters?: TableFilter[];
  searchPlaceholder: string;
  /** What the rows are, for messages: "destinations", "accounts" */
  noun: string;
}

const controlClass =
  'px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]';

// ─── PagedTable ───────────────────────────────────────────────────────────────
// The list view every admin section shares: search box, filters, a sortable
// table, and paging, with loading, empty and error states.

export function PagedTable<T>({ list, columns, rowKey, filters = [], searchPlaceholder, noun }: PagedTableProps<T>) {
  const firstRow = (list.page - 1) * list.pageSize + 1;
  const lastRow = Math.min(list.page * list.pageSize, list.total);

  const topRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={topRef} className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={cn(controlClass, 'w-full pl-10 pr-9')}
          />
          {list.search && (
            <button
              type="button"
              onClick={() => list.setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#090C11] dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <select
                key={filter.key}
                value={list.filters[filter.key] ?? ''}
                onChange={(e) => list.setFilter(filter.key, e.target.value)}
                aria-label={`Filter by ${filter.label.toLowerCase()}`}
                className={cn(controlClass, 'flex-1 lg:flex-none font-medium')}
              >
                <option value="">All {filter.label.toLowerCase()}</option>
                {filter.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] overflow-hidden">
        {list.error ? (
          <ErrorState title={`Could not load ${noun}`} message={list.error} onRetry={list.reload} />
        ) : !list.isLoading && list.rows.length === 0 ? (
          <EmptyState
            title={`No ${noun} found`}
            description={
              list.hasFilters
                ? 'Nothing matches the search and filters you have set.'
                : `There are no ${noun} yet.`
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-left text-xs uppercase tracking-wide text-muted">
                  {columns.map((column) => {
                    const sorted = list.sort?.column === column.sortColumn;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={sorted ? (list.sort?.ascending ? 'ascending' : 'descending') : undefined}
                        className={cn('px-4 py-3 font-semibold whitespace-nowrap', column.className)}
                      >
                        {column.sortColumn ? (
                          <button
                            type="button"
                            onClick={() => list.toggleSort(column.sortColumn!)}
                            className="inline-flex items-center gap-1.5 uppercase tracking-wide hover:text-[#090C11] dark:hover:text-white"
                          >
                            {column.header}
                            {sorted ? (
                              list.sort?.ascending ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                            ) : (
                              <ArrowUpDown size={12} className="opacity-40" />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {list.isLoading
                  ? Array.from({ length: Math.min(list.pageSize, 6) }).map((_, i) => (
                      <tr key={i} aria-hidden="true">
                        {columns.map((column) => (
                          <td key={column.key} className={cn('px-4 py-4', column.className)}>
                            <div className="h-4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : list.rows.map((row) => (
                      <tr key={rowKey(row)} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        {columns.map((column) => (
                          <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                            {column.render(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!list.error && list.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span aria-live="polite">
            Showing {firstRow}–{lastRow} of {list.total} {noun}
          </span>
          {list.totalPages > 1 && (
            <Pagination currentPage={list.page} totalPages={list.totalPages} onPageChange={(page) => {
                list.setPage(page);
                scrollToStart(topRef.current);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PagedTable;
