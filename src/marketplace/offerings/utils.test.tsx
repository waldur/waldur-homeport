import { describe, expect, it } from 'vitest';

import { Offering } from '@waldur/marketplace/types';

import { getDefaultLimits } from './utils';

describe('getDefaultLimits', () => {
  it('should return default limits for limit components and prepaid one-time components', () => {
    const offering = {
      components: [
        {
          type: 'cpu',
          billing_type: 'limit',
          default_limit: 10,
        },
        {
          type: 'ram',
          billing_type: 'limit',
          min_value: 1024,
        },
        {
          type: 'setup',
          billing_type: 'one',
          is_prepaid: true,
          default_limit: 1,
        },
        {
          type: 'license',
          billing_type: 'one',
          is_prepaid: false,
          default_limit: 5,
        },
        {
          type: 'storage',
          billing_type: 'usage',
          default_limit: 100,
        },
        {
          type: 'network',
          billing_type: 'fixed',
          min_value: 10,
        },
      ],
    } as unknown as Offering;

    const result = getDefaultLimits(offering);

    expect(result).toEqual({
      cpu: 10,
      ram: 1024,
      setup: 1,
    });
    expect(result).not.toHaveProperty('license');
    expect(result).not.toHaveProperty('storage');
    expect(result).not.toHaveProperty('network');
  });

  it('should return an empty object if no eligible components have default or min values', () => {
    const offering = {
      components: [
        {
          type: 'cpu',
          billing_type: 'limit',
        },
        {
          type: 'setup',
          billing_type: 'one',
          is_prepaid: true,
        },
        {
          type: 'storage',
          billing_type: 'usage',
          default_limit: 100,
        },
      ],
    } as unknown as Offering;

    const result = getDefaultLimits(offering);

    expect(result).toEqual({});
  });
});
