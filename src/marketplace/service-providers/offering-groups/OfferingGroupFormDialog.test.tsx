import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingGroupsCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OfferingGroupFormDialog } from './OfferingGroupFormDialog';

vi.mock('@/marketplace/common/autocompletes', () => ({
  organizationAutocomplete: () => () =>
    Promise.resolve({
      options: [{ name: 'Provider org', url: 'provider-customer-url' }],
      hasMore: false,
      additional: { page: 2 },
    }),
}));

describe('OfferingGroupFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a group for the given customer without asking for one', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingGroupsCreate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <OfferingGroupFormDialog
        resolve={{ customerUrl: 'own-customer-url', refetch: vi.fn() }}
      />,
    );

    await screen.findByText('Create offering group');
    expect(screen.queryByText('Service provider')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Title/i), 'HPC');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(marketplaceOfferingGroupsCreate).toHaveBeenCalledWith({
        body: {
          title: 'HPC',
          description: undefined,
          customer: 'own-customer-url',
        },
      }),
    );
  });

  it('asks for the service provider when no customer is given', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingGroupsCreate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <OfferingGroupFormDialog resolve={{ refetch: vi.fn() }} />,
    );

    await screen.findByText('Create offering group');
    await user.type(screen.getByLabelText(/Title/i), 'HPC');
    const submit = screen.getByRole('button', { name: 'Create' });
    expect(submit).toBeDisabled();

    await user.click(screen.getByText('Select service provider...'));
    await user.click(await screen.findByText('Provider org'));
    await user.click(submit);

    await waitFor(() =>
      expect(marketplaceOfferingGroupsCreate).toHaveBeenCalledWith({
        body: {
          title: 'HPC',
          description: undefined,
          customer: 'provider-customer-url',
        },
      }),
    );
  });
});
