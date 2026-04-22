import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { UndoDeleteState } from '@/types/record';

interface DeleteUndoToastProps {
  item: UndoDeleteState | null;
  onUndo: () => Promise<void>;
  onDismiss: () => void;
}

export const DeleteUndoToast = ({ item, onUndo, onDismiss }: DeleteUndoToastProps) => {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!item) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const next = item.expiresAt - Date.now();
      if (next <= 0) {
        onDismiss();
        return;
      }
      setRemainingMs(next);
    };

    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [item, onDismiss]);

  const seconds = useMemo(() => Math.max(0, Math.ceil(remainingMs / 1000)), [remainingMs]);

  if (!item) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <Card className="border-border bg-background p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-destructive/10 p-2 text-destructive">
            <Trash className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold">Record deleted</p>
            <p className="text-sm text-muted-foreground">
              {item.record.title} was removed. Undo remains available for {seconds} second{seconds === 1 ? '' : 's'}.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
          <Button onClick={onUndo}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Undo delete
          </Button>
        </div>
      </Card>
    </div>
  );
};
