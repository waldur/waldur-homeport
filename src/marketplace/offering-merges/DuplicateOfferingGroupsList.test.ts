import { describe, expect, it } from 'vitest';
import { DuplicateOfferingGroup } from 'waldur-js-client';

import { getDuplicateGroupSelection } from './DuplicateOfferingGroupsList';

const suggested_mapping = {
  plan_mapping: { 'plan-a': 'plan-k' },
  component_mapping: { a: { cores: 'cores' } },
  unmatched_plans: [],
  unmatched_components: [],
};

describe('getDuplicateGroupSelection', () => {
  it('targets the keeper, merges the duplicates and carries the suggestion', () => {
    const group = {
      keeper_uuid: 'k',
      duplicate_uuids: ['a', 'b'],
      suggested_mapping,
      blockers: [],
      warnings: [],
      candidates: [],
    } as unknown as DuplicateOfferingGroup;
    expect(getDuplicateGroupSelection(group)).toEqual({
      target: 'k',
      sources: ['a', 'b'],
      mapping: suggested_mapping,
    });
  });
});
