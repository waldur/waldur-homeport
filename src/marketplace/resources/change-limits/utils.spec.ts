import { getData } from '@waldur/marketplace/resources/change-limits/utils';

import * as fixtures from './fixtures';

describe('Change resource limits', () => {
  it('returns correct data', () => {
    expect(
      getData(
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
