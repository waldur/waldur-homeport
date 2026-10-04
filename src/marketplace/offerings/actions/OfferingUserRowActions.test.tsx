import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OfferingUserRowActions } from './OfferingUserRowActions';

// Render the menu's actions inline, each update button by its scope.
vi.mock('@/table/ActionsDropdown', () => ({
  ActionsDropdown: ({ actions, row, refetch }) => (
    <div>
      {actions.map((Action, index) => (
        <Action key={index} row={row} refetch={refetch} />
      ))}
    </div>
  ),
}));
vi.mock(
  '@/marketplace/service-providers/ProviderOfferingUserUpdateButton',
  () => ({
    ProviderOfferingUserUpdateButton: ({ updateScope }) => (
      <span>{`update:${updateScope}`}</span>
    ),
  }),
);
vi.mock(
  '@/marketplace/service-providers/ProviderOfferingUserDeleteButton',
  () => ({
    ProviderOfferingUserDeleteButton: () => <span>delete</span>,
  }),
);
vi.mock('@/marketplace/service-providers/RestrictOfferingUser', () => ({
  RestrictOfferingUserButton: () => <span>restrict</span>,
}));
vi.mock('@/marketplace/offerings/details/OfferingUserDetailsButton', () => ({
  OfferingUserDetailsButton: () => <span>details</span>,
}));
vi.mock(
  '@/marketplace/service-providers/accounts/ProviderAccountLink',
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    ProviderAccountAction: () => <span>provider-account</span>,
  }),
);
vi.mock('@/features/connect', () => ({ isFeatureVisible: () => true }));
vi.mock('@/permissions/hasPermission', () => ({ hasPermission: () => true }));

const provider = { uuid: 'provider-1', customer_uuid: 'customer-1' } as any;
const offering = { plugin_options: {} };

const renderActions = (row) =>
  render(
    <OfferingUserRowActions
      row={row}
      fetch={vi.fn()}
      provider={provider}
      offering={offering}
    />,
  );

describe('OfferingUserRowActions', () => {
  it('offers to edit the username and POSIX attributes of an own account', () => {
    renderActions({ uuid: 'ou-1', service_provider_account_uuid: null });

    expect(screen.getByText('update:username')).toBeInTheDocument();
    expect(screen.getByText('update:posix')).toBeInTheDocument();
    expect(screen.queryByText('provider-account')).toBeNull();
  });

  it('sends a backed account to its provider account instead', () => {
    renderActions({ uuid: 'ou-2', service_provider_account_uuid: 'account-1' });

    expect(screen.queryByText('update:username')).toBeNull();
    expect(screen.queryByText('update:posix')).toBeNull();
    expect(screen.getByText('provider-account')).toBeInTheDocument();
    // What stays per offering stays editable.
    expect(screen.getByText('update:comment')).toBeInTheDocument();
    expect(screen.getByText('update:state')).toBeInTheDocument();
  });
});
