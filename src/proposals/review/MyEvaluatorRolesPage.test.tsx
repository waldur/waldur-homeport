import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { MyEvaluatorRolesPage } from './MyEvaluatorRolesPage';

const { rows, tableProps } = vi.hoisted(() => ({
  rows: [
    {
      uuid: 'open',
      proposal_uuid: 'p1',
      proposal_name: 'Open proposal',
      call_name: 'Call A',
      role_name: 'Lead rapporteur',
      is_lead: true,
      coi_confirmation_required: true,
      coi_confirmed_at: '2026-10-01T00:00:00Z',
      coi_declaration_only: false,
      awaits_coi_confirmation: false,
      created: '2026-10-01T00:00:00Z',
    },
    {
      uuid: 'waiting',
      proposal_uuid: 'p2',
      proposal_name: 'Waiting proposal',
      call_name: 'Call B',
      role_name: 'Second rapporteur',
      is_lead: false,
      coi_confirmation_required: true,
      coi_confirmed_at: null,
      coi_declaration_only: false,
      awaits_coi_confirmation: true,
      created: '2026-10-02T00:00:00Z',
    },
  ] as any[],
  tableProps: { value: null as any },
}));

vi.mock('waldur-table/src/useTable', () => ({
  useTable: (options) => {
    tableProps.value = options;
    return { fetch: vi.fn() };
  },
}));

vi.mock('@/table/Table', () => ({
  default: ({ columns, rowActions }) => (
    <>
      {rows.map((row) => (
        <div key={row.uuid} data-testid={`row-${row.uuid}`}>
          {columns.map((column, index) => (
            <span key={index}>{column.render({ row })}</span>
          ))}
          {rowActions({ row, fetch: vi.fn() }) ? (
            <span>has actions</span>
          ) : null}
        </div>
      ))}
    </>
  ),
}));

vi.mock('./tabs', () => ({ useMyReviewsTabs: () => [] }));

vi.mock('@/core/Link', () => ({
  Link: ({ label }) => <a href="#proposal">{label}</a>,
}));

describe('MyEvaluatorRolesPage', () => {
  it('lists the viewer’s active roles, opening only the confirmed ones', () => {
    renderWithProviders(<MyEvaluatorRolesPage />);
    expect(tableProps.value.filter).toMatchObject({ is_active: true });

    expect(
      screen.getByRole('link', { name: 'Open proposal' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();

    // Awaiting the conflict-of-interest confirmation: no way in yet, and
    // the confirmation is offered instead.
    expect(
      screen.queryByRole('link', { name: 'Waiting proposal' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Waiting proposal')).toBeInTheDocument();
    expect(screen.getByText('Awaiting confirmation')).toBeInTheDocument();
    expect(screen.getByTestId('row-waiting')).toHaveTextContent('has actions');
    expect(screen.getByTestId('row-open')).not.toHaveTextContent('has actions');
  });
});
