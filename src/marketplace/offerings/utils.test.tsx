import { describe, expect, it } from 'vitest';

import { Offering } from '@/marketplace/types';

import { getDefaultLimits } from './utils';

describe('getDefaultLimits', () => {
  it('should return default limits for local components and filter out inherited ones', () => {
    const offeringUuid = 'offering-123';
    const offering = {
      uuid: offeringUuid,
      components: [
        {
          type: 'cpu',
          billing_type: 'limit',
          default_limit: 10,
          offering_uuid: offeringUuid,
        },
        {
          type: 'ram',
          billing_type: 'limit',
          min_value: 1024,
          offering_uuid: offeringUuid,
        },
        {
          type: 'storage',
          billing_type: 'limit',
          default_limit: 100,
          offering_uuid: 'parent-456', // Inherited component
        },
        {
          type: 'setup',
          billing_type: 'one',
          is_prepaid: true,
          default_limit: 1,
          offering_uuid: offeringUuid,
        },
        {
          type: 'license',
          billing_type: 'one',
          is_prepaid: false,
          default_limit: 5,
          offering_uuid: offeringUuid,
        },
      ],
    } as unknown as Offering;

    const result = getDefaultLimits(offering);

    expect(result).toEqual({
      cpu: 10,
      ram: 1024,
      setup: 1,
    });
    expect(result).not.toHaveProperty('storage');
    expect(result).not.toHaveProperty('license');
  });

  it('should return an empty object if no eligible components have default or min values', () => {
    const offeringUuid = 'offering-123';
    const offering = {
      uuid: offeringUuid,
      components: [
        {
          type: 'cpu',
          billing_type: 'limit',
          offering_uuid: offeringUuid,
        },
      ],
    } as unknown as Offering;

    const result = getDefaultLimits(offering);

    expect(result).toEqual({});
  });

  it('should include components without offering_uuid for backward compatibility', () => {
    const offering = {
      uuid: 'offering-123',
      components: [
        {
          type: 'cpu',
          billing_type: 'limit',
          default_limit: 10,
        },
      ],
    } as unknown as Offering;

    const result = getDefaultLimits(offering);

    expect(result).toEqual({
      cpu: 10,
    });
  });
});
