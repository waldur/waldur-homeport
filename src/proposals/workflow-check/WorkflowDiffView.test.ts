import { describe, expect, it } from 'vitest';
import { WorkflowChanges } from 'waldur-js-client';

import { diffRows } from './WorkflowDiffView';

const changes: WorkflowChanges = {
  steps: [
    {
      key: 'check',
      name: 'Eligibility check',
      old_name: 'Check',
      change: 'changed',
      kind: 'cosmetic',
      moved: false,
      fields: [
        {
          field: 'name',
          kind: 'cosmetic',
          old: 'Check' as any,
          new: 'Eligibility check' as any,
          added: [],
          removed: [],
        },
      ],
    },
    {
      key: 'review',
      name: 'Review',
      old_name: null,
      change: 'added',
      kind: 'behaviour',
      moved: false,
      fields: [],
    },
  ],
  call: [
    {
      field: 'target_decision_days',
      kind: 'behaviour',
      old: 30 as any,
      new: 45 as any,
      added: [],
      removed: [],
    },
  ],
  proposal_roles: [],
  panels: [],
  forms: [],
  summary: { behaviour: 2, cosmetic: 1 },
};

describe('diffRows', () => {
  it('lists behaviour changes before cosmetic ones', () => {
    expect(diffRows(changes).map((row) => row.id)).toEqual([
      'steps:review',
      'call:target_decision_days',
      'steps:check',
    ]);
  });
});
