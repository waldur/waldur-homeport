import { describe, expect, it, vi } from 'vitest';
import { myAssignmentBatchesList } from 'waldur-js-client';

import { fetchMyAssignmentBatches } from './fetchMyAssignmentBatches';

const batches = Array.from({ length: 12 }, (_, i) => ({
  uuid: `${i + 1}`,
  call_name: i < 3 ? `Exascale ${i}` : `Other ${i}`,
}));

const request = (overrides = {}) =>
  ({
    tableKey: 'MyAssignmentBatchesTable',
    currentPage: 1,
    pageSize: 10,
    filter: {},
    ...overrides,
  }) as any;

describe('fetchMyAssignmentBatches', () => {
  it('counts the whole list and pages it', async () => {
    vi.mocked(myAssignmentBatchesList).mockResolvedValue({
      data: batches,
    } as any);

    const page1 = await fetchMyAssignmentBatches(request());
    expect(page1.resultCount).toBe(12);
    expect(page1.rows).toHaveLength(10);

    const page2 = await fetchMyAssignmentBatches(request({ currentPage: 2 }));
    expect(page2.rows.map((row) => row.uuid)).toEqual(['11', '12']);
  });

  it('searches by call name', async () => {
    vi.mocked(myAssignmentBatchesList).mockResolvedValue({
      data: batches,
    } as any);

    const result = await fetchMyAssignmentBatches(
      request({ filter: { call_name: 'exascale' } }),
    );
    expect(result.resultCount).toBe(3);
  });

  it('asks the server for the statuses the table filters on', async () => {
    vi.mocked(myAssignmentBatchesList).mockResolvedValue({
      data: batches,
    } as any);

    await fetchMyAssignmentBatches(
      request({ filter: { status: ['sent', 'expired'] } }),
    );
    expect(myAssignmentBatchesList).toHaveBeenLastCalledWith({
      query: { status: ['sent', 'expired'] },
    });
  });
});
