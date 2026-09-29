import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsSetOfferingGroup } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OfferingGroupAddOfferingDialog } from './OfferingGroupAddOfferingDialog';

const loaderQueries = vi.hoisted(() => [] as any[]);

vi.mock('@/marketplace/common/autocompletes', () => ({
  providerOfferingsAutocomplete: (query) => {
    loaderQueries.push(query);
    return () =>
      Promise.resolve({
        options: [{ name: 'Basic VM', uuid: 'offering-uuid' }],
        hasMore: false,
        additional: { page: 2 },
      });
  },
}));

const group = {
  uuid: 'group-uuid',
  title: 'HPC',
  customer_uuid: 'customer-uuid',
  customer_name: 'Demo Organization',
} as any;

describe('OfferingGroupAddOfferingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderQueries.length = 0;
  });

  it('offers only offerings of the group organization, except archived ones', async () => {
    renderWithProviders(
      <OfferingGroupAddOfferingDialog resolve={{ group, refetch: vi.fn() }} />,
    );
    await screen.findByText('Add offering');
    expect(loaderQueries[0]).toEqual({
      customer_uuid: 'customer-uuid',
      state: ['Draft', 'Active', 'Paused'],
    });
  });

  it('assigns the chosen offering to the group', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(marketplaceProviderOfferingsSetOfferingGroup).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <OfferingGroupAddOfferingDialog resolve={{ group, refetch }} />,
    );

    await screen.findByText('Add offering');
    const submit = screen.getByRole('button', { name: 'Add' });
    expect(submit).toBeDisabled();

    await user.click(screen.getByText('Select offering...'));
    await user.click(await screen.findByText('Basic VM'));
    await user.click(submit);

    await waitFor(() =>
      expect(marketplaceProviderOfferingsSetOfferingGroup).toHaveBeenCalledWith(
        {
          path: { uuid: 'offering-uuid' },
          body: { offering_group: 'group-uuid' },
        },
      ),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
