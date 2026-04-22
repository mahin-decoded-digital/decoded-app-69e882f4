import { create } from 'zustand';
import { apiUrl } from '@/lib/api';
import type { RecordInput, RecordItem, UndoDeleteState } from '@/types/record';
import { normalizeRecordInput } from '@/lib/record-utils';

interface RecordStoreState {
  records: RecordItem[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastDeleted: UndoDeleteState | null;
  initialize: () => Promise<void>;
  listRecords: () => Promise<RecordItem[]>;
  getRecord: (id: string) => Promise<RecordItem | null>;
  createRecord: (input: RecordInput) => Promise<RecordItem>;
  updateRecord: (id: string, input: RecordInput) => Promise<RecordItem>;
  deleteRecord: (id: string) => Promise<RecordItem>;
  undoDelete: () => Promise<RecordItem | null>;
  clearUndo: () => void;
}

export const useRecordStore = create<RecordStoreState>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  initialized: false,
  lastDeleted: null,
  initialize: async () => {
    if (get().loading || get().initialized) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/records'));
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const records = (await res.json()) as RecordItem[];
      set({ records, loading: false, error: null, initialized: true });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load records.',
        initialized: true,
      });
    }
  },
  listRecords: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/records'));
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const records = (await res.json()) as RecordItem[];
      set({ records, loading: false, initialized: true });
      return records.filter((record) => !record.deletedAt);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to list records.';
      set({ loading: false, error: message });
      return [];
    }
  },
  getRecord: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl(`/api/records/${id}`));
      if (res.status === 404) {
        set({ loading: false });
        return null;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const record = (await res.json()) as RecordItem;
      set((state) => ({
        records: state.records.some((item) => item.id === record.id)
          ? state.records.map((item) => (item.id === record.id ? record : item))
          : [record, ...state.records],
        loading: false,
        initialized: true,
      }));
      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch record.';
      set({ loading: false, error: message });
      return null;
    }
  },
  createRecord: async (input: RecordInput) => {
    set({ loading: true, error: null });
    try {
      const normalized = normalizeRecordInput(input);
      const res = await fetch(apiUrl('/api/records'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const created = (await res.json()) as RecordItem;
      set((state) => ({
        records: [created, ...state.records.filter((record) => record.id !== created.id)],
        loading: false,
        initialized: true,
      }));
      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create record.';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  updateRecord: async (id: string, input: RecordInput) => {
    set({ loading: true, error: null });
    try {
      const normalized = normalizeRecordInput(input);
      const res = await fetch(apiUrl(`/api/records/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const updated = (await res.json()) as RecordItem;
      set((state) => ({
        records: state.records.map((record) => (record.id === id ? updated : record)),
        loading: false,
        initialized: true,
      }));
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update record.';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  deleteRecord: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const existing = get().records.find((record) => record.id === id && !record.deletedAt);
      if (!existing) {
        throw new Error('Record not found.');
      }

      const res = await fetch(apiUrl(`/api/records/${id}`), {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }

      const expiresAt = Date.now() + 8000;
      set((state) => ({
        records: state.records.filter((record) => record.id !== id),
        loading: false,
        lastDeleted: { record: existing, expiresAt },
        initialized: true,
      }));
      return existing;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete record.';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  undoDelete: async () => {
    const lastDeleted = get().lastDeleted;
    if (!lastDeleted || lastDeleted.expiresAt < Date.now()) {
      set({ lastDeleted: null });
      return null;
    }

    set({ loading: true, error: null });
    try {
      const restoreInput: RecordInput = {
        title: lastDeleted.record.title,
        description: lastDeleted.record.description,
        status: lastDeleted.record.status,
        owner: lastDeleted.record.owner,
      };
      const res = await fetch(apiUrl('/api/records'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restoreInput),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const restored = (await res.json()) as RecordItem;
      set((state) => ({
        records: [restored, ...state.records.filter((record) => record.id !== restored.id)],
        lastDeleted: null,
        loading: false,
        initialized: true,
      }));
      return restored;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to undo delete.';
      set({ loading: false, error: message, lastDeleted: null });
      return null;
    }
  },
  clearUndo: () => set({ lastDeleted: null }),
}));