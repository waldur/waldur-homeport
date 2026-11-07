import { describe, expect, it } from 'vitest';
import { WorkflowDescription } from 'waldur-js-client';

import { DESCRIPTION } from '../description.fixture';

import { layoutDiagram, overlaps, stepLane } from './layout';
import { postAwardPlans, roundPlans } from './schedule';
import SHAPES from './templateShapes.fixture.json';

// The shipped JU templates, steps after the award included, reduced to what
// the drawing reads; generated from the backend's workflow description of
// each template by scripts/generate-template-shapes.py, which says how to
// rerun it.
const templates = Object.entries(SHAPES).map(([name, shape]) => [
  name,
  {
    call: { rounds: [], target_decision_days: null },
    ...shape,
  } as unknown as WorkflowDescription,
]) as Array<[string, WorkflowDescription]>;

const withSteps = (overrides: Record<string, Record<string, unknown>>) =>
  ({
    ...DESCRIPTION,
    steps: DESCRIPTION.steps.map((step) => ({
      ...step,
      ...(overrides[step.key] ?? {}),
    })),
  }) as WorkflowDescription;

describe('layoutDiagram', () => {
  it('puts each step in the lane of whoever completes it', () => {
    const layout = layoutDiagram(DESCRIPTION);
    const lanes = Object.fromEntries(
      layout.boxes.map((box) => [box.step.key, box.lane]),
    );
    expect(lanes).toEqual({
      technical: 'offering_team',
      assignment: 'panel_chair',
      report: 'proposal_role_lead:rapporteur',
    });
    // Lanes follow the description's actor order.
    expect(layout.lanes.map((lane) => lane.key)).toEqual([
      'panel_chair',
      'offering_team',
      'proposal_role_lead:rapporteur',
    ]);
  });

  it('gives the steps of one stage one column', () => {
    const layout = layoutDiagram(DESCRIPTION);
    const columns = Object.fromEntries(
      layout.boxes.map((box) => [box.step.key, box.column]),
    );
    expect(columns).toEqual({ technical: 0, assignment: 0, report: 1 });
    expect(layout.columns.map((column) => column.steps)).toEqual([2, 1]);
  });

  it('draws sequence, input, negative and change request edges', () => {
    const layout = layoutDiagram(
      withSteps({
        technical: {
          outcomes: [
            { value: 'feasible', polarity: 'positive' },
            { value: 'infeasible', polarity: 'negative' },
          ],
          on_negative: 'reject',
        },
        report: { allows_change_requests: true },
      }),
    );
    const edges = layout.edges.map(
      (edge) => `${edge.kind}:${edge.from}>${edge.to}`,
    );
    expect(edges).toEqual(
      expect.arrayContaining([
        'sequence:technical>report',
        'sequence:assignment>report',
        'input:technical>report',
        'negative:technical>terminal:rejected',
        'change_request:report>terminal:returned',
      ]),
    );
    expect(layout.terminals.map((terminal) => terminal.kind)).toEqual([
      'rejected',
      'returned',
    ]);
  });

  it('labels a conditional step and lets a skippable stage be bypassed', () => {
    const description = {
      ...DESCRIPTION,
      steps: [
        ...DESCRIPTION.steps,
        {
          ...DESCRIPTION.steps[2],
          key: 'final',
          name: 'Final decision',
          order: 3,
          stage: 3,
          input_steps: [],
        },
      ].map((step) =>
        step.key === 'report'
          ? {
              ...step,
              run_condition: { step: 'technical', outcomes: ['feasible'] },
            }
          : step,
      ),
    } as WorkflowDescription;
    const layout = layoutDiagram(description, {
      conditionLabel: (step) => `if ${step.run_condition?.step}`,
    });
    const condition = layout.edges.filter((edge) => edge.kind === 'condition');
    expect(condition.map((edge) => edge.to)).toEqual(['report', 'report']);
    expect(condition[0].label).toBe('if technical');
    expect(layout.edges.filter((edge) => edge.kind === 'bypass')).toEqual([
      // A diagram edge, not a route.
      { kind: 'bypass', from: 'technical', to: 'final' }, // state-check: ignore
    ]);
  });

  it('hides disabled steps unless asked', () => {
    const description = withSteps({ assignment: { enabled: false } });
    expect(layoutDiagram(description).boxes).toHaveLength(2);
    expect(
      layoutDiagram(description, { showDisabled: true }).boxes,
    ).toHaveLength(3);
  });

  it('places an automatic decision in the system lane', () => {
    expect(
      stepLane({
        ...DESCRIPTION.steps[2],
        decides_automatically: true,
      }),
    ).toBe('system');
  });

  it('draws the steps after the award as a section of their own', () => {
    const report = DESCRIPTION.steps[2];
    const description = {
      ...DESCRIPTION,
      steps: [
        ...DESCRIPTION.steps,
        {
          ...report,
          key: 'extension_request',
          order: 10,
          stage: 5,
          phase: 'extension',
          on_negative: 'reject',
          input_steps: [],
        },
        {
          ...report,
          key: 'extension_decision',
          order: 11,
          stage: 6,
          phase: 'extension',
          on_negative: 'reject',
          input_steps: [],
        },
      ],
    } as unknown as WorkflowDescription;
    const layout = layoutDiagram(description);
    expect(layout.columns.map((column) => column.phase)).toEqual([
      'evaluation',
      'evaluation',
      'extension',
      'extension',
    ]);
    expect(layout.sections).toEqual([
      { phase: 'extension', x: layout.columns[2].x, width: 2 * 232 },
    ]);
    const sequence = layout.edges
      .filter((edge) => edge.kind === 'sequence')
      .map((edge) => `${edge.from}>${edge.to}`);
    // Nothing of the evaluation leads into the extension, which opens later.
    expect(sequence).not.toContain('report>extension_request');
    expect(sequence).toContain('extension_request>extension_decision');
    // A negative outcome after the award closes the run, not the proposal.
    expect(
      layout.edges.filter(
        (edge) => edge.kind === 'negative' && edge.from.startsWith('extension'),
      ),
    ).toEqual([]);
    expect(overlaps(layout)).toBe(false);
  });

  it.each(templates)(
    'draws the %s template without overlaps',
    (name, description) => {
      const layout = layoutDiagram(description, { showDisabled: true });
      expect(layout.boxes.length).toBe(description.steps.length);
      expect(overlaps(layout)).toBe(false);
      expect(
        layout.boxes.map(
          (box) =>
            `${box.step.key}@${box.lane}:${box.column}:${box.x},${box.y}`,
        ),
      ).toMatchSnapshot();
    },
  );
});

describe('roundPlans', () => {
  it('reds the bars past the decision and states the overrun', () => {
    const description = {
      ...DESCRIPTION,
      call: {
        ...DESCRIPTION.call,
        rounds: [
          {
            uuid: 'r1',
            name: 'Spring',
            start_time: null,
            cutoff_time: '2027-01-01T00:00:00Z',
            allocation_date: '2027-01-21T00:00:00Z',
            open_ended: false,
            review_duration_in_days: null,
            time_to_decision_days: 20,
            time_to_decision_source: 'allocation_date',
          },
        ],
      },
      schedule: {
        stages: [],
        steps: [
          {
            key: 'technical',
            stage: 0,
            start_day: 0,
            end_day: 21,
            conditional: false,
            critical: true,
          },
          {
            key: 'assignment',
            stage: 0,
            start_day: 0,
            end_day: 0,
            conditional: false,
            critical: false,
          },
          {
            key: 'report',
            stage: 2,
            start_day: 21,
            end_day: 30,
            conditional: true,
            critical: true,
          },
        ],
        total_days: 30,
        critical_path: ['technical', 'report'],
        steps_without_duration: ['assignment'],
      },
    } as unknown as WorkflowDescription;
    const [plan] = roundPlans(description);
    expect(plan.name).toBe('Spring');
    expect(plan.decisionDay).toBe(20);
    expect(plan.overrunDays).toBe(10);
    expect(
      plan.rows.map((row) => [row.key, row.late, row.critical, row.noDuration]),
    ).toEqual([
      ['technical', true, true, false],
      ['assignment', false, false, true],
      ['report', true, true, false],
    ]);
    // The critical path is the description's.
    expect(
      plan.rows.filter((row) => row.critical).map((row) => row.key),
    ).toEqual(description.schedule.critical_path);
  });

  it('plans a workflow without rounds against the target time to decision', () => {
    const [plan] = roundPlans({
      ...DESCRIPTION,
      call: { ...DESCRIPTION.call, target_decision_days: 60 },
      schedule: { ...DESCRIPTION.schedule, steps: [] },
    } as unknown as WorkflowDescription);
    expect(plan.name).toBeNull();
    expect(plan.decisionDay).toBe(60);
    expect(plan.overrunDays).toBe(0);
  });
});

describe('postAwardPlans', () => {
  it('plans each phase after the award from the opening of its run', () => {
    const plans = postAwardPlans({
      ...DESCRIPTION,
      schedule: {
        ...DESCRIPTION.schedule,
        steps: [],
        post_award: [
          {
            phase: 'extension',
            project_end_offset_days: 30,
            stages: [],
            steps: [
              {
                key: 'report',
                stage: 4,
                start_day: 0,
                end_day: 14,
                conditional: false,
                critical: true,
              },
            ],
            total_days: 14,
            steps_without_duration: [],
          },
        ],
      },
    } as unknown as WorkflowDescription);
    expect(plans).toHaveLength(1);
    expect(plans[0].phase).toBe('extension');
    expect(plans[0].projectEndOffsetDays).toBe(30);
    expect(plans[0].decisionDay).toBeNull();
    expect(plans[0].rows.map((row) => [row.key, row.start, row.end])).toEqual([
      ['report', 0, 14],
    ]);
  });
});
