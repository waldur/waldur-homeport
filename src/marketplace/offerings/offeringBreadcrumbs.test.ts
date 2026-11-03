import { describe, expect, it } from 'vitest';

import { getOfferingBreadcrumbItems } from './hooks';

const offering = {
  name: 'HPC',
  customer_name: 'Provider',
  customer_uuid: 'provider-uuid',
} as any;

describe('getOfferingBreadcrumbItems', () => {
  it('links the marketplace crumbs when the shop is available', () => {
    const items = getOfferingBreadcrumbItems(offering, undefined, 'details');
    expect(items[0].to).toBe('public.marketplace-landing');
    expect(items[1].to).toBe('marketplace-providers.details');
    expect(items[2].to).toBe('marketplace-vendor-offerings');
  });

  it('leaves the shop crumbs as text when the shop is hidden', () => {
    const items = getOfferingBreadcrumbItems(
      offering,
      undefined,
      'details',
      false,
    );
    expect(items[0].to).toBeUndefined();
    expect(items[0].text).toBeTruthy();
    expect(items[1].to).toBeUndefined();
    expect(items[1].text).toBe('Provider');
    expect(items[2].to).toBe('marketplace-vendor-offerings');
  });
});
