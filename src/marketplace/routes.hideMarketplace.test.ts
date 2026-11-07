import { describe, expect, it } from 'vitest';

import {
  canAccessMarketplaceRouteGuard,
  canAccessOfferingPageRouteGuard,
} from '@/marketplace/canUseMarketplaceShopUi';
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

  // Private offerings deploy in calls-only mode too, so the deploy form checks
  // the offering itself.
  it('guards the deploy form with the offering page guard', () => {
    const deploy = byName.get('marketplace-offering-public');
    expect(deploy?.data?.permissions).toEqual([
      canAccessOfferingPageRouteGuard,
    ]);
  });

  it('still guards the marketplace landing page', () => {
    const landing = byName.get('public.marketplace-landing');
    expect(landing?.data?.permissions).toContain(
      canAccessMarketplaceRouteGuard,
    );
  });

  // The calls an offering is listed in link to its page, so calls-only mode
  // leaves it open: it is guarded as the deploy form is.
  it('guards the public offering page with the offering page guard', () => {
    expect(
      byName.get('public-offering.marketplace-public-offering')?.data
        ?.permissions,
    ).toContain(canAccessOfferingPageRouteGuard);
  });

  it('guards the public provider profile', () => {
    expect(
      byName.get('marketplace-providers.details')?.data?.permissions,
    ).toContain(canAccessMarketplaceRouteGuard);
  });

  it('leaves provider workspace pages open', () => {
    for (const name of [
      'marketplace-offering-details',
      'marketplace-provider-orders',
    ]) {
      const permissions = byName.get(name)?.data?.permissions ?? [];
      expect(permissions, name).not.toContain(canAccessMarketplaceRouteGuard);
    }
  });
});
