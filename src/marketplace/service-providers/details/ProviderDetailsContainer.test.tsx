import { screen, waitFor } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { renderWithProviders } from '@/test/harness';

import { ProviderDetailsContainer } from './ProviderDetailsContainer';

vi.mock('@/marketplace/common/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/marketplace/common/api')>()),
  getServiceProviderByCustomer: vi.fn(),
}));

vi.mock('@/navigation/usePageTabsTransmitter', () => ({
  usePageTabsTransmitter: () => ({ tabSpec: null }),
}));

const customerUuid = 'missing-provider-customer';

const provider = {
  uuid: 'provider-uuid',
  customer_uuid: customerUuid,
  customer_name: 'Acme Cloud',
  description: 'Test provider',
};

describe('ProviderDetailsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'public.marketplace-provider' },
      params: { customer_uuid: customerUuid },
    } as never);
  });

  it('shows a message when the customer has no service provider', async () => {
    vi.mocked(getServiceProviderByCustomer).mockResolvedValue(null);

    renderWithProviders(<ProviderDetailsContainer />);

    expect(
      await screen.findByText('Unable to load service provider.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Acme Cloud')).not.toBeInTheDocument();
  });

  it('renders when the service provider exists without hitting the error state', async () => {
    vi.mocked(getServiceProviderByCustomer).mockResolvedValue(
      provider as never,
    );

    renderWithProviders(<ProviderDetailsContainer />);

    await waitFor(() =>
      expect(getServiceProviderByCustomer).toHaveBeenCalledWith({
        customer_uuid: customerUuid,
      }),
    );
    expect(
      screen.queryByText('Unable to load service provider.'),
    ).not.toBeInTheDocument();
  });
});
