import { useMemo } from 'react';
import type { RecordFilters, RecordItem } from '@/types/record';

export const useRecordQuery = (records: RecordItem[], filters: RecordFilters) => {
  return useMemo(() => {
    const ownerFilter = filters.owner.trim().toLowerCase();
    const query = filters.query.trim().toLowerCase();

    const filtered = records
      .filter((record) => !record.deletedAt)
      .filter((record) => {
        const title = record.title.toLowerCase();
        const description = record.description.toLowerCase();
        const owner = record.owner.toLowerCase();

        const matchesQuery = !query || title.includes(query) || description.includes(query);
        const matchesStatus = filters.status === 'all' || record.status === filters.status;
        const matchesOwner = !ownerFilter || owner.includes(ownerFilter);

        return matchesQuery && matchesStatus && matchesOwner;
      })
      .sort((left, right) => {
        const direction = filters.sortDirection === 'asc' ? 1 : -1;
        const leftValue = left[filters.sortBy];
        const rightValue = right[filters.sortBy];

        if (leftValue < rightValue) {
          return -1 * direction;
        }
        if (leftValue > rightValue) {
          return 1 * direction;
        }
        return 0;
      });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const startIndex = (page - 1) * filters.pageSize;
    const paginated = filtered.slice(startIndex, startIndex + filters.pageSize);
    const owners = Array.from(new Set(records.filter((record) => !record.deletedAt && record.owner).map((record) => record.owner))).sort();

    return {
      items: paginated,
      total,
      totalPages,
      page,
      owners,
    };
  }, [records, filters]);
};
