import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { checklistsAdminList } from 'waldur-js-client';

import { useTable } from '@/table/useTable';

import { ChecklistsTable } from './ChecklistsTable';

vi.mock('@/table/useTable', () => ({
  useTable: vi.fn(() => ({ fetch: vi.fn() })),
}));

vi.mock('@/table/Table', () => ({ default: () => null }));

const tableOptions = () => vi.mocked(useTable).mock.lastCall[0];

const table = () => <ChecklistsTable portal={null} />;

describe('ChecklistsTable', () => {
  it('requests every checklist type except feedback', async () => {
    vi.mocked(checklistsAdminList).mockResolvedValue({
      data: [],
      response: new Response('[]', {
        headers: { 'content-type': 'application/json' },
      }),
    } as any);
    render(table());

    const { fetchData, filter } = tableOptions();
    await fetchData({
      tableKey: 'checklists',
      currentPage: 1,
      pageSize: 10,
      filter,
    });

    const query = vi.mocked(checklistsAdminList).mock.lastCall[0].query;
    expect(query.checklist_type__in).not.toContain('feedback');
    expect(query.checklist_type__in).toEqual(
      expect.arrayContaining(['project_metadata', 'workflow_step']),
    );
  });

  it('keeps the same filter object across renders', () => {
    const { rerender } = render(table());
    const first = tableOptions().filter;
    const calls = vi.mocked(useTable).mock.calls.length;
    rerender(table());

    expect(first).toBeDefined();
    expect(vi.mocked(useTable).mock.calls.length).toBeGreaterThan(calls);
    expect(tableOptions().filter).toBe(first);
  });
});
