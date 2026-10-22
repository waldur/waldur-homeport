import { describe, expect, it } from 'vitest';

import { getRetryOrderBody } from './OrderErredView';

describe('getRetryOrderBody', () => {
  it('orders the resource again with its limits and spending limits', () => {
    const resource = {
      offering: 'offering-url',
      project: 'project-url',
      plan: 'plan-url',
      attributes: { name: 'Inference' },
      limits: { cores: 4 },
      spending_limits: { token_cost: { day: 20 } },
    } as any;

    expect(getRetryOrderBody(resource)).toEqual({
      offering: 'offering-url',
      project: 'project-url',
      plan: 'plan-url',
      attributes: { name: 'Inference' },
      limits: { cores: 4 },
      spending_limits: { token_cost: { day: 20 } },
    });
  });
});
