import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DeleteUndoToast } from '@/components/DeleteUndoToast';
import { downloadCsv, formatDateTime, getStatusBadgeVariant } from '@/lib/record-utils';
import { useRecordStore } from '@/stores/recordStore';

export default function RecordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const records = useRecordStore((state) => state.records);
  const loading = useRecordStore((state) => state.loading);
  const error = useRecordStore((state) => state.error);
  const initialized = useRecordStore((state) => state.initialized);
  const lastDeleted = useRecordStore((state) => state.lastDeleted);
  const initialize = useRecordStore((state) => state.initialize);
  const deleteRecord = useRecordStore((state) => state.deleteRecord);
  const clearUndo = useRecordStore((state) => state.clearUndo);
  const undoDelete = useRecordStore((state) => state.undoDelete);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void initialize();
  }, []);

  const record = useMemo(() => {
    if (!id) {
      return null;
    }
    return records.find((item) => item.id === id && !item.deletedAt) ?? null;
  }, [id, records]);

  if (!id) {
    return <Navigate to="/" replace />;
  }

  const handleDelete = async () => {
    if (!record) {
      return;
    }
    setDeleting(true);
    try {
      await deleteRecord(record.id);
      setConfirmDeleteOpen(false);
      navigate('/');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !initialized) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Loading record...</h1>
        <p className="mt-2 text-muted-foreground">Preparing the latest saved data for this detail view.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-destructive">Could not load record</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Return to records
        </Button>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Record not found</h1>
        <p className="mt-2 text-muted-foreground">The requested record may have been deleted or the link is no longer valid.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Back to record list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-8 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" className="px-0" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to records
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{record.title}</h1>
            <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
          </div>
          <p className="max-w-3xl text-muted-foreground">
            Open the full metadata below, export this record as CSV, or move into the edit flow when updates are needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => downloadCsv(record)}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => navigate(`/records/${record.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit record
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDeleteOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl">Record details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-8 pt-0 md:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-border bg-background p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Record ID</p>
              <p className="mt-1 break-all font-mono text-sm">{record.id}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Owner</p>
              <p className="mt-1 text-base font-medium">{record.owner || 'Unassigned'}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created at</p>
              <p className="mt-1 text-base font-medium">{formatDateTime(record.createdAt)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Updated at</p>
              <p className="mt-1 text-base font-medium">{formatDateTime(record.updatedAt)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-foreground">
              {record.description || 'No description provided for this record.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              {record.title} will be removed from the list immediately. You can undo this action for a short time after deletion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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