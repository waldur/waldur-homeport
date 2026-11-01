import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime, formatRelative } from '@/core/dateUtils';

import { getResourceSummaryFields } from './utils';

const buildResource = (overrides = {}) =>
  ({
    end_date: null,
    project_end_date: '2026-09-06',
    // Grace-awareness now lives on the backend; the frontend just renders this.
    resource_effective_end_date: '2026-10-06',
    ...overrides,
  }) as any;

const scheduledTermination = (resource: any) =>
  getResourceSummaryFields({ resource }).find(
    (f) => f.name === 'effective_termination',
  );

describe('getResourceSummaryFields — Scheduled termination', () => {
  it('renders the backend-computed effective end date', () => {
    const field = scheduledTermination(
      buildResource({ resource_effective_end_date: '2026-09-06' }),
    );
    expect(field?.value).toBe(formatDate('2026-09-06'));
  });

  it('renders the effective (with-grace) end date for a normal offering', () => {
    const field = scheduledTermination(buildResource());
    expect(field?.value).toBe(formatDate('2026-10-06'));
  });
});

describe('getResourceSummaryFields — Terminated at', () => {
  const terminatedAt = '2026-09-06T10:30:00Z';
  const fieldValue = (resource: any, name: string) =>
    getResourceSummaryFields({ resource }).find((f) => f.name === name)?.value;

  it('replaces the planned dates of a terminated resource', () => {
    const resource = buildResource({
      state: 'Terminated',
      terminated_at: terminatedAt,
      end_date: '2026-12-01',
    });
    expect(fieldValue(resource, 'terminated_at')).toBe(
      `${formatDateTime(terminatedAt)} (${formatRelative(terminatedAt)})`,
    );
    expect(fieldValue(resource, 'end_date')).toBeNull();
    expect(fieldValue(resource, 'effective_termination')).toBeNull();
  });

  it('keeps the planned dates when the moment is unknown', () => {
    const resource = buildResource({
      state: 'Terminated',
      terminated_at: null,
      end_date: '2026-12-01',
    });
    expect(fieldValue(resource, 'terminated_at')).toBeNull();
    expect(fieldValue(resource, 'end_date')).toBe(formatDate('2026-12-01'));
  });

  it('ignores the date kept while a restore is in progress', () => {
    const resource = buildResource({
      state: 'Creating',
      terminated_at: terminatedAt,
    });
    expect(fieldValue(resource, 'terminated_at')).toBeNull();
  });
});
