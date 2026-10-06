import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRoundsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';

import { CallRoundsList } from './CallRoundsList';

const tableOptions = vi.hoisted(() => ({ current: null as any }));
const tableProps = vi.hoisted(() => ({ current: null as any }));

// Capture what the list hands the table, and leave the table itself out: the
// question is which rounds reach it, not how it draws them.
vi.mock('@/table/useTable', () => ({
  useTable: (options: any) => {
    tableOptions.current = options;
    return { rows: [], fetch: vi.fn(), pagination: {} };
  },
}));
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableProps.current = props;
    return null;
  },
}));

const call = {
  uuid: 'call-uuid',
  manager_uuid: 'managing-org-uuid',
  customer_uuid: 'customer-uuid',
  rounds: [
    {
      uuid: 'round-uuid',
      slug: 'public-round',
      start_time: '2026-01-01T00:00:00Z',
      cutoff_time: '2026-02-01T00:00:00Z',
      status: 'ended',
      lifecycle_state: 'results_published',
    },
  ],
} as any;

const protectedRound = {
  ...call.rounds[0],
  slug: 'protected-round',
  adopted_at: '2026-03-01T00:00:00Z',
  adoption_note: 'Adopted by the board',
  held_decisions_count: 0,
};

const request = { tableKey: 'rounds', currentPage: 1, pageSize: 10 } as any;

const reviewer = {
  permissions: [
    {
      role_name: 'CALL.REVIEWER',
      scope_type: 'call',
      scope_uuid: 'call-uuid',
      customer_uuid: 'customer-uuid',
    },
  ],
};

const renderAs = (user: any) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user);
  renderWithProviders(<CallRoundsList call={call} />);
  return tableOptions.current.fetchData(request);
};

describe('Public call rounds list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'CALL.REVIEWER', permissions: [] },
    ] as any);
  });

  it('shows applicants the public rounds without asking for the protected ones', async () => {
    const page = await renderAs({ permissions: [] });
    expect(proposalProtectedCallsRoundsList).not.toHaveBeenCalled();
    expect(page.rows.map((row) => row.slug)).toEqual(['public-round']);
    expect(page.rows[0].adopted_at).toBeUndefined();
  });

  it('shows anonymous visitors the public rounds', async () => {
    const page = await renderAs(undefined);
    expect(proposalProtectedCallsRoundsList).not.toHaveBeenCalled();
    expect(page.rows.map((row) => row.slug)).toEqual(['public-round']);
  });

  it('reads the rounds with their adoption record for the call team', async () => {
    vi.mocked(proposalProtectedCallsRoundsList).mockResolvedValue(
      mockListResponse([protectedRound]),
    );
    const page = await renderAs(reviewer);
    expect(proposalProtectedCallsRoundsList).toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: 'call-uuid' } }),
    );
    expect(page.rows.map((row) => row.slug)).toEqual(['protected-round']);
    expect(page.rows[0].adoption_note).toBe('Adopted by the board');
    // The State column reads the same derived status as the public rows.
    expect(page.rows[0].status.label).toBe('Ended');
  });

  it('falls back to the public rounds when the protected read is refused', async () => {
    vi.mocked(proposalProtectedCallsRoundsList).mockRejectedValue({
      response: { status: 403 },
    });
    const page = await renderAs(reviewer);
    expect(proposalProtectedCallsRoundsList).toHaveBeenCalled();
    expect(page.rows.map((row) => row.slug)).toEqual(['public-round']);
  });

  it('lets other failures of the protected read surface', async () => {
    vi.mocked(proposalProtectedCallsRoundsList).mockRejectedValue({
      response: { status: 500 },
    });
    await expect(renderAs(reviewer)).rejects.toEqual({
      response: { status: 500 },
    });
  });

  // A call announcing each decision at once withholds nothing, so the
  // adoption record is the call team's to read before results are published.
  it('shows the adoption record by the rules of the call it belongs to', () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue(reviewer as any);
    renderWithProviders(
      <CallRoundsList call={{ ...call, publish_results: 'immediately' }} />,
    );
    const ExpandableRow = tableProps.current.expandableRow;
    renderWithProviders(
      <ExpandableRow
        row={{
          ...protectedRound,
          lifecycle_state: 'deciding',
          held_decisions_count: null,
        }}
      />,
    );
    expect(screen.getByTestId('round-adoption')).toBeInTheDocument();
  });
});
