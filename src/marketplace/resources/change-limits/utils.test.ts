import { describe, it, expect } from 'vitest';

import { getLimitChangeData } from '@/marketplace/resources/change-limits/utils';

import * as fixtures from './fixtures';

describe('Change resource limits', () => {
  it('returns correct data', () => {
    expect(
      getLimitChangeData(
        fixtures.plan,
        fixtures.offering,
        fixtures.newLimits,
        fixtures.currentLimits,
        fixtures.usages,
        fixtures.orderCanBeApproved,
      ),
    ).toEqual(fixtures.resultData);
  });
});
