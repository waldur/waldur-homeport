import { describe, expect, it } from 'vitest';

import { canAccessMarketplaceRouteGuard } from '@/marketplace/canUseMarketplaceShopUi';
import { states } from '@/states';

describe('hide_marketplace_from_end_users route policy', () => {
  const byName = new Map(states.map((state) => [state.name, state]));

  it('does not guard order details with the marketplace shop guard', () => {
    const orderDetails = byName.get('marketplace-orders.details');
    expect(orderDetails).toBeDefined();
    const permissions = orderDetails?.data?.permissions ?? [];
    expect(permissions).not.toContain(canAccessMarketplaceRouteGuard);
  });

  it('still guards the global marketplace orders list', () => {
    const ordersList = byName.get('auth-marketplace-orders');
    expect(ordersList?.data?.permissions).toContain(
      canAccessMarketplaceRouteGuard,
    );
  });

  it('still guards the marketplace landing page', () => {
    const landing = byName.get('public.marketplace-landing');
    expect(landing?.data?.permissions).toContain(
      canAccessMarketplaceRouteGuard,
    );
  });
});
