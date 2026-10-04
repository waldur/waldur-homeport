import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ProviderAccountExpandableRow } from './ProviderAccountExpandableRow';

// The table and its state live in the Redux store; render the cells directly.
vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div>
      {props.rows.map((row) => (
        <div key={row.uuid}>
          {props.columns.map((column, index) => (
            <span key={index}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/table/useTable', () => ({
  useTable: () => ({
    rows: [
      {
        uuid: 'ou-1',
        offering_name: 'Cluster A',
        username: 'jdoe',
        service_provider_account_uuid: 'account-1',
        state: 'OK',
        created: '2024-01-01T00:00:00Z',
      },
      {
        uuid: 'ou-2',
        offering_name: 'Cluster B',
        username: 'j.doe',
        service_provider_account_uuid: null,
        state: 'OK',
        created: '2024-01-01T00:00:00Z',
      },
      {
        // Its own account, though it happens to carry the same name.
        uuid: 'ou-3',
        offering_name: 'Cluster C',
        username: 'jdoe',
        service_provider_account_uuid: null,
        state: 'OK',
        created: '2024-01-01T00:00:00Z',
      },
    ],
    fetch: vi.fn(),
  }),
}));

const account = {
  uuid: 'account-1',
  user_uuid: 'user-1',
  username: 'jdoe',
  state: 'OK',
  is_restricted: false,
  created: '2024-01-01T00:00:00Z',
} as any;

describe('ProviderAccountExpandableRow', () => {
  it('marks offering accounts that share the provider account', () => {
    renderWithProviders(<ProviderAccountExpandableRow row={account} />);

    expect(screen.getByText('Cluster A')).toBeInTheDocument();
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it("shows the username of an offering's own account", () => {
    renderWithProviders(<ProviderAccountExpandableRow row={account} />);

    expect(screen.getByText('j.doe')).toBeInTheDocument();
    expect(screen.getAllByText('Own account')).toHaveLength(2);
  });

  it('decides by the link, not by a coinciding username', () => {
    renderWithProviders(<ProviderAccountExpandableRow row={account} />);

    // Clusters A and C both say "jdoe"; only A reads through the account.
    expect(screen.getAllByText('Shared')).toHaveLength(1);
    expect(screen.getAllByText('Own account')).toHaveLength(2);
  });
});
