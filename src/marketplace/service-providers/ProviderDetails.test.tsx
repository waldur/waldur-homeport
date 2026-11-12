import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsList } from 'waldur-js-client';

import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { renderWithProviders } from '@/test/harness';

import { ProviderDetails } from './ProviderDetails';

vi.mock('@/marketplace/common/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/marketplace/common/api')>()),
  getServiceProviderByCustomer: vi.fn(),
}));

const customerUuid = 'customer-uuid';

describe('ProviderDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'marketplace-provider-details' },
      params: { customer_uuid: customerUuid },
    } as never);
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue({
      data: [],
    } as never);
  });

  it('shows a message when the customer has no service provider', async () => {
    vi.mocked(getServiceProviderByCustomer).mockResolvedValue(null);

    renderWithProviders(<ProviderDetails />);

    expect(
      await screen.findByText('Unable to load service provider.'),
    ).toBeInTheDocument();
  });
});
