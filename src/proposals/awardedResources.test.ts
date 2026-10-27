import { describe, expect, it } from 'vitest';

import {
  asCostRow,
  awardDiffers,
  canEditAward,
  compareAward,
  getAwardOptionLines,
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

// waldur/waldur-homeport#129 on GitHub: a QoS changed by the call manager
// read as "As requested".
describe('options in the award', () => {
  const slurm = {
    ...hpc,
    options: {
      order: ['qos'],
      options: {
        qos: {
          type: 'select_string',
          label: 'QoS',
          required: true,
          choices: ['parallel', 'balanced'],
        },
      },
    },
  };
  const requested = {
    ...request('r1', slurm, { cpu_hours: 1000 }),
    attributes: { qos: 'parallel' },
  };
  const awarded = (qos?: string) => ({
    ...award('a1', 'r1', slurm, { cpu_hours: 1000 }, 'plan-standard'),
    attributes: qos === undefined ? {} : { qos },
  });

  it('reports a changed option as a change', () => {
    const [row] = compareAward([requested], [awarded('balanced')]);
    expect(row.change).toBe('changed');
  });

  it('reports the same option as unchanged', () => {
    const [row] = compareAward([requested], [awarded('parallel')]);
    expect(row.change).toBe('unchanged');
  });

  it('shows the awarded option, with what was requested where it differs', () => {
    const [changed] = compareAward([requested], [awarded('balanced')]);
    expect(getAwardOptionLines(changed)).toEqual([
      { key: 'qos', label: 'QoS', value: 'balanced', requested: 'parallel' },
    ]);
    const [same] = compareAward([requested], [awarded('parallel')]);
    expect(getAwardOptionLines(same)).toEqual([
      { key: 'qos', label: 'QoS', value: 'parallel' },
    ]);
  });

  it('does not take the same answer in another form as a change', () => {
    const offering = {
      ...slurm,
      options: {
        order: ['qos', 'nodes', 'notify', 'models'],
        options: {
          ...slurm.options.options,
          nodes: { type: 'integer', label: 'Nodes' },
          notify: { type: 'boolean', label: 'Notify' },
          models: { type: 'select_string_multi', label: 'Models' },
        },
      },
    };
    const asked = {
      ...request('r1', offering, { cpu_hours: 1000 }),
      attributes: { qos: 'parallel', nodes: 4, models: ['a', 'b'] },
    };
    const given = {
      ...award('a1', 'r1', offering, { cpu_hours: 1000 }, 'plan-standard'),
      // A number read back as text, an unticked box, the same models in
      // another order.
      attributes: {
        qos: 'parallel',
        nodes: '4',
        notify: false,
        models: ['b', 'a'],
      },
    };
    const [row] = compareAward([asked], [given]);
    expect(row.change).toBe('unchanged');
    expect(getAwardOptionLines(row).some((line) => 'requested' in line)).toBe(
      false,
    );
  });

  // An award form may store the same text with or without markup.
  it('does not take a difference in markup alone as a change', () => {
    const offering = {
      ...slurm,
      options: {
        order: ['qos', 'notes', 'justification'],
        options: {
          ...slurm.options.options,
          notes: { type: 'html_text', label: 'Notes' },
          justification: { type: 'html_text', label: 'Justification' },
        },
      },
    };
    const asked = {
      ...request('r1', offering, { cpu_hours: 1000 }),
      attributes: { qos: 'parallel', notes: 'a', justification: '' },
    };
    const given = {
      ...award('a1', 'r1', offering, { cpu_hours: 1000 }, 'plan-standard'),
      attributes: {
        qos: 'parallel',
        notes: '<p>a</p>',
        justification: '<p></p>',
      },
    };
    const [row] = compareAward([asked], [given]);
    expect(row.change).toBe('unchanged');
    expect(row.optionLines.some((line) => 'requested' in line)).toBe(false);
  });

  it('shows an option the award dropped', () => {
    const [row] = compareAward([requested], [awarded()]);
    expect(row.change).toBe('changed');
    expect(getAwardOptionLines(row)).toEqual([
      { key: 'qos', label: 'QoS', value: null, requested: 'parallel' },
    ]);
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
