import { describe, it, expect } from 'vitest';

import { getMarketplaceResourceUuid } from './utils';

describe('getMarketplaceResourceUuid', () => {
  it('returns marketplace_resource_uuid if present', () => {
    const resource = {
      uuid: 'instance-uuid',
      marketplace_resource_uuid: 'marketplace-uuid',
    };
    expect(getMarketplaceResourceUuid(resource)).toBe('marketplace-uuid');
  });

  it('returns uuid if offering_type is present (marketplace resource)', () => {
    const resource = {
      uuid: 'marketplace-uuid',
      offering_type: 'OpenStack.Instance',
    };
    expect(getMarketplaceResourceUuid(resource)).toBe('marketplace-uuid');
  });

  it('returns null if both marketplace_resource_uuid and offering_type are missing (plugin resource)', () => {
    const resource = {
      uuid: 'instance-uuid',
      resource_type: 'OpenStack.Instance',
    };
    expect(getMarketplaceResourceUuid(resource)).toBe(null);
  });
});
