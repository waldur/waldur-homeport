import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CallDiscussionsList } from './CallDiscussionsList';

const { table } = vi.hoisted(() => ({
  table: { options: null as any, rows: [] as any[] },
}));

vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));

vi.mock('waldur-table/src/useTable', () => ({
  useTable: (options) => {
    table.options = options;
    return { fetch: vi.fn() };
  },
}));

vi.mock('@/table/Table', () => ({
  default: (props) => (
    <>
      {props.tableActions}
      {table.rows.map((row) => (
        <div key={row.uuid}>
          {props.columns.map((column, index) => (
            <span key={index}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </>
  ),
}));

const discussion = {
  uuid: 'discussion-1',
  state: 'open',
  opened_at: '2026-11-15T10:00:00Z',
  closed_at: null,
  opened_by_uuid: 'user-2',
  opened_by_name: 'Vera Rubin',
  call_uuid: 'call-1',
  call_name: 'Regular Access',
  call_step_uuid: 'step-1',
  step_key: 'panel',
  step_name: 'Panel meeting',
  round_scoped: true,
  proposal_step_uuid: null,
  proposal_uuid: null,
  proposal_name: null,
  proposal_slug: null,
  round_step_uuid: 'round-step-1',
  round_uuid: 'round-1',
  round_name: 'Round 1',
  panel_uuid: 'panel-1',
  panel_name: 'Physics',
  room_uuid: 'room-1',
  room_id: '!room:localhost',
  room_state: 'active',
  export_uuid: null,
  participants: [
    { uuid: 'user-2', full_name: 'Vera Rubin', username: 'vera' },
    { uuid: 'user-3', full_name: 'Carl Sagan', username: 'carl' },
  ],
};

describe('CallDiscussionsList', () => {
  beforeEach(() => {
    table.options = null;
    table.rows = [discussion];
  });

  it("lists every discussion of the call, not only the viewer's", () => {
    renderWithProviders(
      <CallDiscussionsList call={{ uuid: 'call-1' } as any} />,
    );

    expect(screen.getByText('Panel meeting')).toBeInTheDocument();
    expect(screen.getByText('Round 1, Physics')).toBeInTheDocument();
    expect(screen.getByText('by Vera Rubin')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(table.options.filter).toEqual({ call_uuid: 'call-1' });
  });

  it('narrows to open discussions on request', async () => {
    renderWithProviders(
      <CallDiscussionsList call={{ uuid: 'call-1' } as any} />,
    );

    await userEvent.click(screen.getByLabelText('Only open'));
    expect(table.options.filter).toEqual({
      call_uuid: 'call-1',
      state: 'open',
    });
  });
});
