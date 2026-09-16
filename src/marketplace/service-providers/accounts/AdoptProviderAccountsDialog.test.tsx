import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceServiceProvidersAdoptProviderAccounts } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AdoptProviderAccountsDialog } from './AdoptProviderAccountsDialog';

const provider = { uuid: 'provider-uuid' } as any;

const conflict = {
  user_uuid: 'user-uuid',
  user_username: 'jane',
  user_full_name: 'Jane Doe',
  candidates: [
    {
      username: 'jdoe',
      offering_count: 2,
      offering_uuids: [],
      has_active_resources: true,
      home_directories: [],
    },
    {
      username: 'j.doe',
      offering_count: 1,
      offering_uuids: [],
      has_active_resources: false,
      home_directories: [],
    },
  ],
};

const renderDialog = (conflicts = []) =>
  renderWithProviders(
    <AdoptProviderAccountsDialog
      resolve={{ provider, conflicts, refetch: vi.fn() }}
    />,
  );

describe('AdoptProviderAccountsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      marketplaceServiceProvidersAdoptProviderAccounts,
    ).mockResolvedValue({ data: { adopted: 1, backed: 2 } } as any);
  });

  it('adopts agreeing accounts without choices', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Resolve' }));

    await waitFor(() =>
      expect(
        marketplaceServiceProvidersAdoptProviderAccounts,
      ).toHaveBeenCalledWith({
        path: { uuid: 'provider-uuid' },
        body: { resolutions: {} },
      }),
    );
  });

  it('asks for the surviving username of each person in conflict', () => {
    renderDialog([conflict]);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeDisabled();
  });
});
