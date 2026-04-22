import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordForm } from '@/components/RecordForm';
import { useRecordStore } from '@/stores/recordStore';
import type { RecordInput } from '@/types/record';

export default function EditRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const records = useRecordStore((state) => state.records);
  const initialized = useRecordStore((state) => state.initialized);
  const loading = useRecordStore((state) => state.loading);
  const error = useRecordStore((state) => state.error);
  const initialize = useRecordStore((state) => state.initialize);
  const updateRecord = useRecordStore((state) => state.updateRecord);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (values: RecordInput) => {
    if (!record) {
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateRecord(record.id, values);
      navigate(`/records/${updated.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !initialized) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Loading edit form...</h1>
        <p className="mt-2 text-muted-foreground">Fetching the latest record state before editing.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-destructive">Could not open record</h1>
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
        <p className="mt-2 text-muted-foreground">This record is unavailable for editing. It may have been deleted.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Back to records
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Button variant="ghost" className="w-fit px-0" onClick={() => navigate(`/records/${record.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to detail view
        </Button>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Edit flow</p>
        <h1 className="text-3xl font-bold">Update {record.title}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Keep the same familiar schema while confirming changes before save. The updated timestamp will refresh automatically.
        </p>
      </div>

      <RecordForm
        mode="edit"
        record={record}
        initialValues={{
          title: record.title,
          description: record.description,
          status: record.status,
          owner: record.owner,
        }}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}