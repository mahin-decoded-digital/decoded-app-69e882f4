import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordForm } from '@/components/RecordForm';
import { useRecordStore } from '@/stores/recordStore';
import type { RecordInput } from '@/types/record';

export default function NewRecordPage() {
  const navigate = useNavigate();
  const initialize = useRecordStore((state) => state.initialize);
  const createRecord = useRecordStore((state) => state.createRecord);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void initialize();
  }, []);

  const handleSubmit = async (values: RecordInput) => {
    setSubmitting(true);
    try {
      const created = await createRecord(values);
      navigate(`/records/${created.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Create flow</p>
          <h1 className="mt-2 text-3xl font-bold">Add a new record</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Capture the core metadata your team needs from day one. Validation runs inline so required fields are clear before submit.
          </p>
        </div>
      </div>
      <RecordForm mode="create" submitting={submitting} onSubmit={handleSubmit} />
    </div>
  );
}