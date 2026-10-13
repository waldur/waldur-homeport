import { describe, expect, it } from 'vitest';

import { getOfferingComponentsKey } from './offeringComponentsKey';

describe('getOfferingComponentsKey', () => {
  it('keeps offerings that share a UUID prefix apart', () => {
    const rds = { offering_uuid: '5cf10000000000000000000000000001' };
    const rcs = { offering_uuid: '5cf10000000000000000000000000002' };

    expect(getOfferingComponentsKey([rds])).not.toEqual(
      getOfferingComponentsKey([rcs]),
    );
  });

  it('gives the same key for the same offerings in any order', () => {
    const a = { offering_uuid: 'b0000000000000000000000000000001' };
    const b = { offering_uuid: 'a0000000000000000000000000000002' };

    expect(getOfferingComponentsKey([a, b, a])).toEqual(
      getOfferingComponentsKey([b, a]),
    );
  });
});
