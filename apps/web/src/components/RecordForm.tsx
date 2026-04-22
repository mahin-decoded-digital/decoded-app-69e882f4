import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RECORD_STATUSES, validateRecordInput } from '@/lib/record-utils';
import type { RecordInput, RecordItem } from '@/types/record';
import { cn } from '@/lib/utils';

interface RecordFormProps {
  mode: 'create' | 'edit';
  initialValues?: RecordInput;
  record?: RecordItem;
  submitting: boolean;
  onSubmit: (values: RecordInput) => Promise<void>;
}

const emptyValues: RecordInput = {
  title: '',
  description: '',
  status: 'draft',
  owner: '',
};

export const RecordForm = ({ mode, initialValues, record, submitting, onSubmit }: RecordFormProps) => {
  const [values, setValues] = useState<RecordInput>(initialValues ?? emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof RecordInput, string>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasChanges = useMemo(() => {
    const base = initialValues ?? emptyValues;
    return JSON.stringify(values) !== JSON.stringify(base);
  }, [initialValues, values]);

  const updateField = <K extends keyof RecordInput>(key: K, value: RecordInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const runValidation = (): boolean => {
    const nextErrors = validateRecordInput(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePrimaryAction = async () => {
    if (!runValidation()) {
      return;
    }

    if (mode === 'edit') {
      setConfirmOpen(true);
      return;
    }

    await onSubmit(values);
  };

  const confirmEdit = async () => {
    setConfirmOpen(false);
    await onSubmit(values);
  };

  return (
    <>
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-2 p-8">
          <CardTitle className="text-3xl font-bold">{mode === 'create' ? 'Create a record' : 'Edit record'}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {mode === 'create'
              ? 'Use the standard RecordFlow schema to add a searchable record for your team.'
              : `Review and update ${record?.title ?? 'this record'} with validated fields and a confirmation step.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-8 pt-0">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Enter a descriptive record title"
              aria-invalid={Boolean(errors.title)}
              className={cn(errors.title && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.title ? <p className="text-sm text-destructive">{errors.title}</p> : <p className="text-sm text-muted-foreground">Required. Titles are searchable and shown in the list.</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Add optional details, context, or notes"
              rows={6}
              aria-invalid={Boolean(errors.description)}
              className={cn(errors.description && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Optional. Search matches descriptions instantly.</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={values.status}
                onChange={(event) => updateField('status', event.target.value as RecordInput['status'])}
                aria-invalid={Boolean(errors.status)}
                className={cn(errors.status && 'border-destructive focus-visible:ring-destructive')}
              >
                {RECORD_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
              {errors.status ? <p className="text-sm text-destructive">{errors.status}</p> : <p className="text-sm text-muted-foreground">Required. Used for list filters and sorting.</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={values.owner}
                onChange={(event) => updateField('owner', event.target.value)}
                placeholder="e.g. Maya Patel"
                aria-invalid={Boolean(errors.owner)}
                className={cn(errors.owner && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.owner ? <p className="text-sm text-destructive">{errors.owner}</p> : <p className="text-sm text-muted-foreground">Optional. Helpful for owner-based filters.</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {mode === 'edit' ? (
                <p className="text-sm text-muted-foreground">{hasChanges ? 'You have unsaved changes.' : 'No changes yet. Update fields to enable save.'}</p>
              ) : (
                <p className="text-sm text-muted-foreground">New records are added immediately and kept in persistent local storage.</p>
              )}
            </div>
            <Button onClick={handlePrimaryAction} disabled={submitting || (mode === 'edit' && !hasChanges)}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Saving...' : mode === 'create' ? 'Create record' : 'Save changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm record update</DialogTitle>
            <DialogDescription>
              Save your changes to {record?.title ?? 'this record'}? This updates the latest version shown in the detail panel and list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmEdit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Confirm save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
