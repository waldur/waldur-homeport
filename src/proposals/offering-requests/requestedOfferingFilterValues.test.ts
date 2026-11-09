import { describe, expect, it } from 'vitest';

import { withRequestedOfferingUuids } from './requestedOfferingFilterValues';

describe('withRequestedOfferingUuids', () => {
  it('takes the UUID of a value saved as a hyperlink', () => {
    expect(
      withRequestedOfferingUuids({
        call: {
          name: 'Regular',
          url: 'https://x/api/proposal-public-calls/abc123/',
        },
        offering: { url: 'https://x/api/marketplace-public-offerings/def456/' },
        state: [{ value: 'accepted' }],
      }),
    ).toEqual({
      call: {
        name: 'Regular',
        url: 'https://x/api/proposal-public-calls/abc123/',
        uuid: 'abc123',
      },
      offering: {
        url: 'https://x/api/marketplace-public-offerings/def456/',
        uuid: 'def456',
      },
      state: [{ value: 'accepted' }],
    });
  });

  it('keeps a value that has its UUID', () => {
    const values = { call: { uuid: 'abc', name: 'Regular' } };
    expect(withRequestedOfferingUuids(values).call).toEqual(values.call);
  });
});
