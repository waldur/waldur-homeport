import { describe, expect, it } from 'vitest';

import {
  asCostRow,
  awardDiffers,
  canEditAward,
  compareAward,
  hasReachedAllocationDecision,
  isAwardSectionShown,
  pickOfferingLimits,
  withAwardedResourcesStep,
} from './awardedResources';

const hpc = {
  uuid: 'call-offering-hpc',
  offering_name: 'HPC Standard',
  plan_details: { uuid: 'plan-standard', name: 'Standard' },
  components: [{ type: 'cpu_hours', billing_type: 'limit' }],
};
const gpu = {
  uuid: 'call-offering-gpu',
  offering_name: 'GPU Burst',
  plan_details: { uuid: 'plan-gpu', name: 'GPU' },
  components: [{ type: 'gpu_hours', billing_type: 'limit' }],
};

const request = (uuid: string, offering, limits) =>
  ({ uuid, requested_offering: offering, limits, attributes: {} }) as any;

const award = (
  uuid: string,
  requested_resource: string | null,
  offering,
  limits,
  plan: string | null = null,
) =>
  ({
    uuid,
    requested_resource,
    requested_offering: offering,
    limits,
    attributes: {},
    plan,
  }) as any;

describe('compareAward', () => {
  it('reports an award copied from the request as unchanged', () => {
    const rows = compareAward(
      [request('r1', hpc, { cpu_hours: 1000 })],
      [award('a1', 'r1', hpc, { cpu_hours: 1000 }, 'plan-standard')],
    );
    expect(rows.map((r) => r.change)).toEqual(['unchanged']);
    expect(awardDiffers(rows)).toBe(false);
  });

  it('flags changed amounts, moved, added and dropped items', () => {
    const rows = compareAward(
      [
        request('r1', hpc, { cpu_hours: 1000 }),
        request('r2', hpc, { cpu_hours: 500 }),
        request('r3', gpu, { gpu_hours: 10 }),
      ],
      [
        award('a1', 'r1', hpc, { cpu_hours: 600 }),
        award('a2', 'r2', gpu, { gpu_hours: 50 }),
        award('a3', null, gpu, { gpu_hours: 5 }),
      ],
    );
    expect(rows.map((r) => [r.uuid, r.change])).toEqual([
      ['a1', 'changed'],
      ['a2', 'moved'],
      ['a3', 'added'],
      ['r3', 'removed'],
    ]);
    expect(awardDiffers(rows)).toBe(true);
  });

  it('treats a missing amount as zero rather than as a change', () => {
    const rows = compareAward(
      [request('r1', hpc, { cpu_hours: 0 })],
      [award('a1', 'r1', hpc, {})],
    );
    expect(rows[0].change).toBe('unchanged');
  });

  it('flags a plan other than the one requested', () => {
    const rows = compareAward(
      [request('r1', hpc, { cpu_hours: 1000 })],
      [award('a1', 'r1', hpc, { cpu_hours: 1000 }, 'plan-premium')],
    );
    expect(rows[0].change).toBe('changed');
  });
});

describe('hasReachedAllocationDecision', () => {
  it('is false before the decision opens', () => {
    expect(
      hasReachedAllocationDecision(
        { state: 'in_review' } as any,
        [
          { step: 'panel_review', status: 'active' },
          { step: 'allocation_decision', status: 'pending' },
        ] as any,
      ),
    ).toBe(false);
  });

  it('is true once the decision is active or past', () => {
    expect(
      hasReachedAllocationDecision(
        { state: 'in_review' } as any,
        [{ step: 'allocation_decision', status: 'active' }] as any,
      ),
    ).toBe(true);
    expect(hasReachedAllocationDecision({ state: 'accepted' } as any, [])).toBe(
      true,
    );
  });
});

describe('pickOfferingLimits', () => {
  it('keeps only the amounts the chosen offering has components for', () => {
    expect(
      pickOfferingLimits(
        { cpu_hours: 15000, gpu_hours: 3000, cpu: 20000, gpu: 1000 },
        { components: [{ type: 'cpu' }, { type: 'gpu' }, { type: 'ram' }] },
      ),
    ).toEqual({ cpu: 20000, gpu: 1000 });
  });
});

describe('asCostRow', () => {
  it('prices an item on the call plan and leaves one pinned elsewhere unpriced', () => {
    const onCallPlan = award(
      'a1',
      'r1',
      hpc,
      { cpu_hours: 1 },
      'plan-standard',
    );
    expect(asCostRow(onCallPlan)).toBe(onCallPlan);
    const pinned = award('a2', 'r1', hpc, { cpu_hours: 1 }, 'plan-premium');
    expect(asCostRow(pinned).requested_offering.plan_details).toBeNull();
  });
});

describe('canEditAward', () => {
  const allocation = { step: 'allocation_decision' } as any;

  it('lets a manager edit while the allocation decision is open', () => {
    expect(canEditAward(true, { decision_held: false }, allocation)).toBe(true);
    // Null for viewers not told about held decisions.
    expect(canEditAward(true, { decision_held: null }, allocation)).toBe(true);
  });

  it('closes the editor while the decision is held for publication', () => {
    expect(canEditAward(true, { decision_held: true }, allocation)).toBe(false);
  });

  it('closes it on any other step, and for anyone who may not decide', () => {
    expect(
      canEditAward(true, { decision_held: false }, {
        step: 'award_response',
      } as any),
    ).toBe(false);
    expect(canEditAward(true, { decision_held: false }, undefined)).toBe(false);
    expect(canEditAward(false, { decision_held: false }, allocation)).toBe(
      false,
    );
  });
});

describe('isAwardSectionShown', () => {
  const item = { uuid: 'award-1' } as any;

  it('hides the section from a viewer refused the award', () => {
    expect(isAwardSectionShown(null, false)).toBe(false);
    expect(isAwardSectionShown(null, true)).toBe(false);
  });

  it('waits for the award to load', () => {
    expect(isAwardSectionShown(undefined, true)).toBe(false);
  });

  it('shows the editor even while nothing is awarded', () => {
    expect(isAwardSectionShown([], true)).toBe(true);
  });

  it('shows a reader the award only when something is awarded', () => {
    expect(isAwardSectionShown([], false)).toBe(false);
    expect(isAwardSectionShown([item], false)).toBe(true);
  });
});

describe('withAwardedResourcesStep', () => {
  const steps = [
    { id: 'step-general', label: 'Details overview' },
    { id: 'step-resource-requests', label: 'Resource requests' },
    { id: 'step-team', label: 'Project team' },
  ];

  it('lists the award right after the request it answers', () => {
    expect(withAwardedResourcesStep(steps, true).map((s) => s.id)).toEqual([
      'step-general',
      'step-resource-requests',
      'step-awarded-resources',
      'step-team',
    ]);
  });

  it('leaves the rail alone when the section is not on the page', () => {
    expect(withAwardedResourcesStep(steps, false)).toBe(steps);
  });
});
