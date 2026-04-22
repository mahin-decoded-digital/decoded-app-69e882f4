import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteUndoToast } from '@/components/DeleteUndoToast';
import { RecordTable } from '@/components/RecordTable';
import { DEFAULT_RECORD_FILTERS } from '@/lib/record-utils';
import { useRecordQuery } from '@/hooks/useRecordQuery';
import { useRecordStore } from '@/stores/recordStore';
import type { RecordFilters } from '@/types/record';

export default function RecordsPage() {
  const navigate = useNavigate();
  const records = useRecordStore((state) => state.records);
  const loading = useRecordStore((state) => state.loading);
  const error = useRecordStore((state) => state.error);
  const initialized = useRecordStore((state) => state.initialized);
  const lastDeleted = useRecordStore((state) => state.lastDeleted);
  const initialize = useRecordStore((state) => state.initialize);
  const clearUndo = useRecordStore((state) => state.clearUndo);
  const undoDelete = useRecordStore((state) => state.undoDelete);
  const [filters, setFilters] = useState<RecordFilters>(DEFAULT_RECORD_FILTERS);

  useEffect(() => {
    void initialize();
  }, []);

  const result = useRecordQuery(records, filters);
  const syncedFilters = useMemo(
    () => ({
      ...filters,
      page: result.page,
    }),
    [filters, result.page],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Operations-ready CRUD</p>
          <h2 className="text-3xl font-bold">All records in one focused workspace</h2>
          <p className="max-w-2xl text-muted-foreground">
            Search and sort instantly, open details for a full read-only view, and manage each record with predictable confirmation and recovery flows.
          </p>
        </div>
        <Button onClick={() => navigate('/records/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create record
        </Button>
      </div>

      <RecordTable
        items={result.items}
        filters={syncedFilters}
        owners={result.owners}
        total={result.total}
        totalPages={result.totalPages}
        loading={loading && !initialized}
        error={error}
        onFiltersChange={(updater) => setFilters((current) => updater(current))}
      />

      <DeleteUndoToast
        item={lastDeleted}
        onDismiss={clearUndo}
        onUndo={async () => {
          await undoDelete();
        }}
      />
    </div>
  );
}