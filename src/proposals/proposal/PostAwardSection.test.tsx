import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it } from 'vitest';

import { PROPOSAL_FLUSH_TABLE_CLASS } from '@/proposals/flushTable';
import { tablesReducer } from '@/table/store';
import { renderWithProviders } from '@/test/harness';

import { RunsTable } from './PostAwardSection';

const proposal = { uuid: 'proposal-1', state: 'accepted' } as any;

const runs = [
  {
    uuid: 'run-1',
    phase: 'final_report',
    state: 'approved',
    opened_at: '2026-11-11T10:00:00Z',
  },
] as any[];

const access = {
  actsForApplicant: false,
  drivesCall: false,
  requestUnlocked: false,
} as any;

describe('RunsTable', () => {
  // The table sits inside the section card: it takes no second border and
  // no empty floor under its few rows.
  it('renders flush in its section, sized to its rows', async () => {
    renderWithProviders(
      <Provider store={createStore(combineReducers({ tables: tablesReducer }))}>
        <RunsTable
          proposal={proposal}
          rows={runs}
          version={1}
          access={access}
        />
      </Provider>,
    );
    expect(await screen.findByText('Approved')).toBeInTheDocument();
    const table = screen.getByRole('table');
    // eslint-disable-next-line testing-library/no-node-access
    const card = table.closest('[data-slot="card"][data-variant="table"]');
    expect(card).toHaveClass(...PROPOSAL_FLUSH_TABLE_CLASS.split(' '));
    // eslint-disable-next-line testing-library/no-node-access
    const scroller = table.closest<HTMLElement>(
      '[data-slot="table-responsive"]',
    );
    expect(scroller?.style.minHeight).toBe('auto');
  });
});
