import { describe, expect, it } from 'vitest';
import { Resource } from 'waldur-js-client';

import { selectCreditUsageFilter } from './CreditUsageFilter';

describe('selectCreditUsageFilter', () => {
  // On a marketplace Resource, `resource_uuid` is the backend/scope uuid (null
  // until provisioned), while `uuid` is the resource's own marketplace uuid.
  // The invoice-items endpoint filters on the marketplace uuid, so sending
  // `resource_uuid` matched nothing (or, unprovisioned, everything). Regression
  // guard for that leak.
  const resource = {
    uuid: 'marketplace-uuid',
    resource_uuid: 'backend-scope-uuid',
    name: 'vm-1',
  } as unknown as Resource;

  it("scopes invoice items by the resource's own marketplace uuid", () => {
    expect(selectCreditUsageFilter({ resource }).resource_uuid).toBe(
      'marketplace-uuid',
    );
  });

  it('omits the resource filter when no resource is selected', () => {
    expect(selectCreditUsageFilter({}).resource_uuid).toBeUndefined();
    expect(selectCreditUsageFilter().resource_uuid).toBeUndefined();
  });
});
