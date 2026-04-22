export type RecordStatus = 'draft' | 'active' | 'archived';

export interface RecordItem {
  id: string;
  title: string;
  description: string;
  status: RecordStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface RecordInput {
  title: string;
  description: string;
  status: RecordStatus;
  owner: string;
}

export interface RecordFilters {
  query: string;
  status: RecordStatus | 'all';
  owner: string;
  sortBy: 'title' | 'status' | 'owner' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface RecordListResponse {
  items: RecordItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RecordApiState {
  loading: boolean;
  error: string | null;
}

export interface UndoDeleteState {
  record: RecordItem;
  expiresAt: number;
}
