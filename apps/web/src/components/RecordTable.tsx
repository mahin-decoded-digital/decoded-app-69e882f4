import {ArrowUp, ChevronRight, Search, SlidersHorizontal} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE_OPTIONS, RECORD_STATUSES, formatDateTime, getStatusBadgeVariant, highlightMatches } from '@/lib/record-utils';
import type { RecordFilters, RecordItem } from '@/types/record';
import { cn } from '@/lib/utils';

interface RecordTableProps {
  items: RecordItem[];
  filters: RecordFilters;
  owners: string[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onFiltersChange: (updater: (current: RecordFilters) => RecordFilters) => void;
}

const columns: { key: RecordFilters['sortBy']; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
  { key: 'createdAt', label: 'Created' },
];

export const RecordTable = ({ items, filters, owners, total, totalPages, loading, error, onFiltersChange }: RecordTableProps) => {
  const setSort = (sortBy: RecordFilters['sortBy']) => {
    onFiltersChange((current) => ({
      ...current,
      sortBy,
      sortDirection: current.sortBy === sortBy && current.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="gap-6 p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">Record list</CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              Browse every record with instant search, owner and status filters, sortable fields, and configurable pages.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
            Showing <span className="font-semibold text-foreground">{items.length}</span> of <span className="font-semibold text-foreground">{total}</span> matching records
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-border bg-background p-5 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Search records</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={(event) => onFiltersChange((current) => ({ ...current, query: event.target.value, page: 1 }))}
                placeholder="Search title or description"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onChange={(event) => onFiltersChange((current) => ({ ...current, status: event.target.value as RecordFilters['status'], page: 1 }))}
            >
              <option value="all">All statuses</option>
              {RECORD_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Owner</label>
            <Select
              value={filters.owner}
              onChange={(event) => onFiltersChange((current) => ({ ...current, owner: event.target.value, page: 1 }))}
            >
              <option value="">All owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Page size</label>
            <Select
              value={String(filters.pageSize)}
              onChange={(event) => onFiltersChange((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))}
            >
              {DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Quick reset</label>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                onFiltersChange((current) => ({
                  ...current,
                  query: '',
                  status: 'all',
                  owner: '',
                  page: 1,
                }))
              }
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[2.2fr_1fr_1fr_1.2fr_56px] border-b border-border bg-muted/30 px-5 py-3 text-sm font-semibold text-muted-foreground">
            {columns.map((column) => (
              <button
                key={column.key}
                type="button"
                className="flex items-center gap-2 text-left"
                onClick={() => setSort(column.key)}
              >
                {column.label}
                <ArrowUp className={cn('h-4 w-4', filters.sortBy === column.key ? 'text-foreground' : 'text-muted-foreground')} />
              </button>
            ))}
            <span className="sr-only">Open</span>
          </div>

          {loading ? (
            <div className="grid place-items-center gap-2 px-6 py-16 text-center">
              <p className="text-lg font-semibold">Loading records...</p>
              <p className="text-sm text-muted-foreground">Fetching the latest saved data.</p>
            </div>
          ) : error ? (
            <div className="grid place-items-center gap-2 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-destructive">Unable to load records</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="grid place-items-center gap-2 px-6 py-16 text-center">
              <p className="text-lg font-semibold">No matching records</p>
              <p className="max-w-md text-sm text-muted-foreground">Try adjusting your search or filters, or create a new record to get started.</p>
            </div>
          ) : (
            items.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[2.2fr_1fr_1fr_1.2fr_56px] items-center gap-4 border-b border-border bg-background px-5 py-4 last:border-b-0 hover:bg-muted/20"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {highlightMatches(record.title, filters.query).map((part, index) => (
                      <span key={`${record.id}-title-${index}`} className={part.match ? 'rounded bg-yellow-200/70 px-0.5' : undefined}>
                        {part.text}
                      </span>
                    ))}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {highlightMatches(record.description || 'No description provided.', filters.query).map((part, index) => (
                      <span key={`${record.id}-desc-${index}`} className={part.match ? 'rounded bg-yellow-200/70 px-0.5' : undefined}>
                        {part.text}
                      </span>
                    ))}
                  </p>
                </div>
                <div>
                  <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
                </div>
                <div className="text-sm text-foreground">{record.owner || 'Unassigned'}</div>
                <div className="text-sm text-muted-foreground">{formatDateTime(record.createdAt)}</div>
                <Button asChild variant="ghost" size="icon">
                  <Link to={`/records/${record.id}`} aria-label={`Open ${record.title}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{filters.page}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => onFiltersChange((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={filters.page >= totalPages}
              onClick={() => onFiltersChange((current) => ({ ...current, page: Math.min(totalPages, current.page + 1) }))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
