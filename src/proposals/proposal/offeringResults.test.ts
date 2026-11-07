import { describe, expect, it } from 'vitest';

import { getStepOfferingResults } from './offeringResults';

const row = (offering: string, status: string, outcome = '') => ({
  call_step_uuid: 'tech',
  offering_name: offering,
  status,
  outcome,
});

describe('getStepOfferingResults', () => {
  it('counts each offering’s outcome instead of the aggregate word', () => {
    const results = getStepOfferingResults([
      row('Cluster', 'submitted', 'accepted'),
      row('Booster', 'submitted', 'rejected'),
    ] as any);
    expect(results.tech.summary).toBe('1 accepted, 1 rejected');
    expect(results.tech.results).toEqual([
      { offering: 'Cluster', result: 'Accepted' },
      { offering: 'Booster', result: 'Rejected' },
    ]);
  });

  it('counts offerings still to be assessed as pending', () => {
    const results = getStepOfferingResults([
      row('Cluster', 'submitted', 'conditionally_accepted'),
      row('Booster', 'pending'),
    ] as any);
    expect(results.tech.summary).toBe('1 conditionally accepted, 1 pending');
    expect(results.tech.results[1]).toEqual({
      offering: 'Booster',
      result: 'Pending',
    });
  });

  it('has nothing for a viewer who reads no assessments', () => {
    expect(getStepOfferingResults(undefined)).toEqual({});
  });
});
