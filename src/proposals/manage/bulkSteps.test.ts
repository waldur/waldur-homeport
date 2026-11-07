import { describe, expect, it } from 'vitest';

import { groupByDecisionStep, runEach } from './bulkSteps';

const instance = (values: Record<string, unknown>) =>
  ({
    uuid: `i-${values.call_step_uuid}`,
    status: 'active',
    kind: 'decision',
    is_allocation_decision: false,
    round_scoped: false,
    allowed_outcomes: ['eligible', 'ineligible'],
    ...values,
  }) as any;

describe('groupByDecisionStep', () => {
  it('groups the proposals by the decision step they stand on, largest first', () => {
    const groups = groupByDecisionStep([
      {
        proposal: { uuid: 'p1', name: 'One' },
        instances: [instance({ call_step_uuid: 'tech', step_name: 'Tech' })],
      },
      {
        proposal: { uuid: 'p2', name: 'Two' },
        instances: [
          instance({ call_step_uuid: 'admin', step_name: 'Admin check' }),
        ],
      },
      {
        proposal: { uuid: 'p3', name: 'Three' },
        instances: [
          instance({ call_step_uuid: 'admin', step_name: 'Admin check' }),
        ],
      },
    ]);
    expect(
      groups.map((g) => [g.stepName, g.targets.map((t) => t.proposal.uuid)]),
    ).toEqual([
      ['Admin check', ['p2', 'p3']],
      ['Tech', ['p1']],
    ]);
  });

  it('leaves out what is decided on each proposal', () => {
    const groups = groupByDecisionStep([
      {
        proposal: { uuid: 'p1', name: 'One' },
        instances: [
          instance({ call_step_uuid: 'award', is_allocation_decision: true }),
          instance({ call_step_uuid: 'review', kind: 'assessment' }),
          instance({ call_step_uuid: 'round', round_scoped: true }),
          instance({ call_step_uuid: 'done', status: 'completed' }),
        ],
      },
    ]);
    expect(groups).toEqual([]);
  });
});

describe('runEach', () => {
  it('goes on past a refusal and names the proposal refused', async () => {
    const result = await runEach(
      ['a', 'b', 'c'],
      (item) =>
        item === 'b'
          ? Promise.reject({ status: 400, detail: 'Not at this step.' })
          : Promise.resolve(),
      (item) => item.toUpperCase(),
    );
    expect(result).toEqual({
      done: 2,
      failures: [{ name: 'B', reason: 'Not at this step.' }],
    });
  });
});
