import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOrdersOfferingRetrieve,
  marketplaceOrdersResourceRetrieve,
  marketplaceOrdersRetrieve,
  marketplacePluginsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OrderDetailsContainer } from './OrderDetailsContainer';

vi.mock('./details/OrderDetails', () => ({
  OrderDetails: ({ limits }) => (
    <div>Order details, limits: {JSON.stringify(limits)}</div>
  ),
}));

const renderContainer = (offering: Record<string, unknown>) => {
  vi.mocked(marketplaceOrdersOfferingRetrieve).mockResolvedValue({
    data: { uuid: 'offering-uuid', ...offering },
  } as any);
  return renderWithProviders(<OrderDetailsContainer />);
};

describe('OrderDetailsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'marketplace-orders.details' },
      params: { order_uuid: 'order-uuid' },
    } as any);
    vi.mocked(marketplaceOrdersRetrieve).mockResolvedValue({
      data: { uuid: 'order-uuid', state: 'done' },
    } as any);
    vi.mocked(marketplaceOrdersResourceRetrieve).mockResolvedValue({
      data: { uuid: 'resource-uuid' },
    } as any);
    vi.mocked(marketplacePluginsList).mockResolvedValue({
      data: [{ offering_type: 'Marketplace.Basic', available_limits: ['cpu'] }],
    } as any);
  });

  it('takes the limits from the offering type plugin', async () => {
    renderContainer({ type: 'Marketplace.Basic' });
    expect(
      await screen.findByText('Order details, limits: ["cpu"]'),
    ).toBeInTheDocument();
  });

  // An offering type with no frontend plugin (a legacy type, or a plugin the
  // deployment does not run) must not take the page down.
  it('falls back to the offering limits when its type has no plugin', async () => {
    renderContainer({
      type: 'Legacy.Removed',
      effective_available_limits: ['storage'],
    });
    expect(
      await screen.findByText('Order details, limits: ["storage"]'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Unable to load order details.'),
    ).not.toBeInTheDocument();
  });
});
