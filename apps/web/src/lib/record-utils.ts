import type { RecordFilters, RecordInput, RecordItem, RecordStatus } from '@/types/record';

export const RECORD_STATUSES: { value: RecordStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_RECORD_FILTERS: RecordFilters = {
  query: '',
  status: 'all',
  owner: '',
  sortBy: 'updatedAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

export const sampleRecords = (): RecordItem[] => {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      title: 'Q2 onboarding checklist',
      description: 'Tracks cross-functional setup steps for new operations hires and their handoff milestones.',
      status: 'active',
      owner: 'Maya Patel',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 12).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      deletedAt: null,
    },
    {
      id: crypto.randomUUID(),
      title: 'Vendor audit log',
      description: 'Central record for compliance updates, audit findings, and remediation owners.',
      status: 'draft',
      owner: 'Jordan Kim',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 24).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
      deletedAt: null,
    },
    {
      id: crypto.randomUUID(),
      title: 'Release readiness notes',
      description: 'Live operational status, launch blockers, and go/no-go notes for the upcoming release.',
      status: 'archived',
      owner: 'Alex Rivera',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 42).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      deletedAt: null,
    },
    {
      id: crypto.randomUUID(),
      title: 'Customer escalation tracker',
      description: 'High-priority customer issues, escalation owners, next actions, and due dates.',
      status: 'active',
      owner: 'Chris Wong',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 15).toISOString(),
      deletedAt: null,
    },
    {
      id: crypto.randomUUID(),
      title: 'Procurement policy refresh',
      description: 'Draft updates to approval thresholds, review cadence, and stakeholder sign-off notes.',
      status: 'draft',
      owner: 'Maya Patel',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 18).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 7).toISOString(),
      deletedAt: null,
    },
  ];
};

export const normalizeRecordInput = (input: RecordInput): RecordInput => ({
  title: input.title.trim(),
  description: input.description.trim(),
  status: input.status,
  owner: input.owner.trim(),
});

export const validateRecordInput = (input: RecordInput): Partial<Record<keyof RecordInput, string>> => {
  const normalized = normalizeRecordInput(input);
  const errors: Partial<Record<keyof RecordInput, string>> = {};

  if (!normalized.title) {
    errors.title = 'Title is required.';
  } else if (normalized.title.length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!normalized.status) {
    errors.status = 'Status is required.';
  }

  if (normalized.description && normalized.description.length > 1000) {
    errors.description = 'Description must be under 1000 characters.';
  }

  if (normalized.owner.length > 80) {
    errors.owner = 'Owner must be under 80 characters.';
  }

  return errors;
};

export const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export const toCsv = (record: RecordItem): string => {
  const headers = ['id', 'title', 'description', 'status', 'owner', 'createdAt', 'updatedAt'];
  const values = [
    record.id,
    record.title,
    record.description,
    record.status,
    record.owner,
    record.createdAt,
    record.updatedAt,
  ];

  const escapeCell = (cell: string): string => `"${cell.replace(/"/g, '""')}"`;

  return `${headers.join(',')}\n${values.map((value) => escapeCell(value)).join(',')}`;
};

export const downloadCsv = (record: RecordItem): void => {
  const csv = toCsv(record);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${record.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'record'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const highlightMatches = (text: string, query: string): { text: string; match: boolean }[] => {
  if (!query.trim()) {
    return [{ text, match: false }];
  }

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'ig');
  const parts = text.split(regex).filter((part) => part.length > 0);

  return parts.map((part) => ({
    text: part,
    match: part.toLowerCase() === query.toLowerCase(),
  }));
};

export const getStatusBadgeVariant = (status: RecordStatus): 'default' | 'secondary' | 'outline' => {
  if (status === 'active') {
    return 'default';
  }

  if (status === 'draft') {
    return 'secondary';
  }

  return 'outline';
};
