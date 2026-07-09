import { describe, expect, it } from 'vitest';

import { formatDate } from '@/core/dateUtils';

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
