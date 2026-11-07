import { describe, expect, it } from 'vitest';

import { allocationSummary, outcomeStatus } from './allocationOutcome';

const RESOURCE = 'https://example.org/api/marketplace-resources/abc/';

describe('outcomeStatus', () => {
  it.each([
    ['done', 'allocated'],
    ['pending-consumer', 'awaiting-approval'],
    ['pending-provider', 'awaiting-provider'],
    ['pending-project', 'awaiting-start'],
    ['pending-start-date', 'awaiting-start'],
    ['executing', 'provisioning'],
    ['rejected', 'refused'],
    ['erred', 'failed'],
    ['canceled', 'canceled'],
  ])('reads the order state %s as %s', (orderState, expected) => {
    expect(
      outcomeStatus({
        resource: RESOURCE,
        offeringState: 'accepted',
        orderState,
      }),
    ).toBe(expected);
  });

  it('reports a request the award dropped as not awarded', () => {
    expect(
      outcomeStatus({
        resource: null,
        change: 'removed',
        offeringState: 'accepted',
      }),
    ).toBe('not-awarded');
  });

  it('reports an item on an offering the provider has not accepted', () => {
    expect(outcomeStatus({ resource: null, offeringState: 'canceled' })).toBe(
      'offering-not-accepted',
    );
    expect(outcomeStatus({ resource: null, offeringState: 'requested' })).toBe(
      'offering-not-accepted',
    );
  });

  it('treats a resource without a reported order as allocated', () => {
    expect(
      outcomeStatus({ resource: RESOURCE, offeringState: 'accepted' }),
    ).toBe('allocated');
  });

  it('admits it does not know when nothing explains a missing resource', () => {
    expect(outcomeStatus({ resource: null, offeringState: 'accepted' })).toBe(
      'unknown',
    );
  });
});

describe('allocationSummary', () => {
  it('says nothing when every request was allocated', () => {
    expect(allocationSummary(['allocated', 'allocated'])).toBeNull();
    expect(allocationSummary([])).toBeNull();
  });

  it('counts the allocated requests otherwise', () => {
    expect(allocationSummary(['allocated', 'not-awarded'])).toBe(
      '1 of 2 requests were allocated.',
    );
    expect(
      allocationSummary(['awaiting-provider', 'refused', 'allocated']),
    ).toBe('1 of 3 requests were allocated.');
  });
});
