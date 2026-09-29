import { describe, expect, it } from 'vitest';

import {
  isOfferingGroupOfferingsQuery,
  offeringGroupOfferingsTableKey,
} from './constants';

const query = (queryKey: unknown[]) => ({ queryKey }) as any;

describe('isOfferingGroupOfferingsQuery', () => {
  it('matches the offerings table of any group', () => {
    expect(
      isOfferingGroupOfferingsQuery(
        query(['table', offeringGroupOfferingsTableKey('a'), { page: 1 }]),
      ),
    ).toBe(true);
    expect(
      isOfferingGroupOfferingsQuery(
        query(['table', offeringGroupOfferingsTableKey('b')]),
      ),
    ).toBe(true);
  });

  it('leaves other tables alone', () => {
    expect(
      isOfferingGroupOfferingsQuery(
        query(['table', 'admin-marketplace-offering-groups']),
      ),
    ).toBe(false);
    expect(
      isOfferingGroupOfferingsQuery(
        query(['other', offeringGroupOfferingsTableKey('a')]),
      ),
    ).toBe(false);
  });
});
