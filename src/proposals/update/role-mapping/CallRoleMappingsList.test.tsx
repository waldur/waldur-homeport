import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DASH_ESCAPE_CODE } from '@/table/constants';

import { CallRoleMappingsList } from './CallRoleMappingsList';

const rows = [
  { uuid: 'm1', proposal_role: 'PROPOSAL.CUSTOM', project_role: 'admin' },
  { uuid: 'm2', proposal_role: 'PROPOSAL.OTHER', project_role: null },
];

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn() }),
}));

// Render each column's cell for the fixed rows; the table chrome is not under
// test here.
vi.mock('@/table/Table', () => ({
  default: ({ columns }) => (
    <>
      {rows.flatMap((row) =>
        columns.map((column, index) => (
          <span key={`${row.uuid}-${index}`} data-testid="cell">
            {column.render({ row })}
          </span>
        )),
      )}
    </>
  ),
}));

describe('CallRoleMappingsList', () => {
  it('shows uncached roles by name, cached ones by description, unset as a dash', () => {
    render(<CallRoleMappingsList call={{ uuid: 'call-uuid' }} />);
    const cells = screen.getAllByTestId('cell').map((cell) => cell.textContent);
    expect(cells).toEqual([
      'PROPOSAL.CUSTOM',
      'Administrator',
      'PROPOSAL.OTHER',
      DASH_ESCAPE_CODE,
    ]);
  });
});
