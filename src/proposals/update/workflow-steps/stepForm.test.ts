import { describe, expect, it } from 'vitest';

import { STEP_KINDS } from '../../workflow/stepKinds.fixture';

import {
  buildStepBody,
  contributorRole,
  EMPTY_STEP_VALUES,
  pagesWithErrors,
  runConditionBody,
  stepFieldShown,
  stepFormPages,
  stepFormValues,
} from './stepForm';

const kind = (id: string) => STEP_KINDS.find((k) => k.id === id);

describe('buildStepBody and evaluator roles', () => {
  it('sends every role an assignment step assigns', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Rapporteurs',
        assigns_roles: ['lead', 'second'],
      },
      kind('assignment'),
    );
    expect(body.assigns_roles).toEqual(['lead', 'second']);
  });

  it('sends an empty list when an assignment step assigns no role', () => {
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Rapporteurs' },
      kind('assignment'),
    );
    expect(body.assigns_roles).toEqual([]);
  });

  it('sends no assigned roles for a kind that assigns none', () => {
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Report', assigns_roles: ['role-1'] },
      kind('assessment'),
    );
    expect('assigns_roles' in body).toBe(false);
  });

  it('sends the completing role only with the evaluator-role completer', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Consolidated report',
      completer_proposal_role: 'role-1',
    };
    expect(
      buildStepBody(
        { ...values, completer: 'proposal_role' },
        kind('assessment'),
      ).completer_proposal_role,
    ).toBe('role-1');
    expect(
      buildStepBody({ ...values, completer: 'reviewer' }, kind('assessment'))
        .completer_proposal_role,
    ).toBeNull();
  });

  it('reads the roles back from a step', () => {
    const values = stepFormValues({
      kind: 'assignment',
      name: 'Rapporteurs',
      assigns_roles: ['lead', 'second'],
      completer_proposal_role: null,
    } as any);
    expect(values.assigns_roles).toEqual(['lead', 'second']);
    expect(values.completer_proposal_role).toBeNull();
  });
});

describe('buildStepBody', () => {
  it('sends who contributes to an assessment and how their work counts', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Technical assessment',
        outcome_set: 'per_offering',
        on_negative: 'continue',
        contributor_source: 'requested_offering_team',
        per_requested_offering: true,
        min_contributions: 1,
        max_contributions: 3,
      },
      kind('assessment'),
    );

    // One contribution per offering: no maximum.
    expect(body).toMatchObject({
      outcome_set: 'per_offering',
      on_negative: 'continue',
      contributor_source: 'requested_offering_team',
      per_requested_offering: true,
      min_contributions: 1,
      max_contributions: null,
    });
  });

  it('sends the maximum of a step of named contributors', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Expert review',
        contributor_source: 'assigned_reviewers',
        max_contributions: 3,
      },
      kind('assessment'),
    );

    expect(body.max_contributions).toBe(3);
  });

  it('sends no contribution settings for a kind without contributors', () => {
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Allocation decision' },
      kind('decision'),
    );

    expect(body).not.toHaveProperty('contributor_source');
    expect(body).not.toHaveProperty('per_requested_offering');
    expect(body).not.toHaveProperty('max_contributions');
  });

  it('keeps a minimum of zero apart from no minimum', () => {
    const zero = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Review', min_contributions: 0 },
      kind('assessment'),
    );
    const empty = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Review', min_contributions: null },
      kind('assessment'),
    );

    expect(zero.min_contributions).toBe(0);
    expect(empty.min_contributions).toBeNull();
  });

  it('reads the contribution settings of a saved step', () => {
    const values = stepFormValues({
      name: 'Technical assessment',
      contributor_source: 'requested_offering_team',
      per_requested_offering: true,
      min_contributions: 2,
      max_contributions: null,
    } as any);

    expect(values.contributor_source).toBe('requested_offering_team');
    expect(values.per_requested_offering).toBe(true);
    expect(values.min_contributions).toBe(2);
    expect(values.max_contributions).toBeNull();
  });
});

describe('buildStepBody and step inputs', () => {
  it('sends the input steps of any kind and reads them back', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Response to reviews',
        input_steps: ['review', 'questions'],
      },
      kind('applicant_action'),
    );
    expect(body.input_steps).toEqual(['review', 'questions']);
    const values = stepFormValues({
      kind: 'applicant_action',
      name: 'Response to reviews',
      input_steps: ['review'],
    } as any);
    expect(values.input_steps).toEqual(['review']);
    expect(values.release_to_applicant).toBe(false);
  });

  it('sends the release flag only for an assessment', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Consolidated report',
      release_to_applicant: true,
    };
    expect(buildStepBody(values, kind('assessment')).release_to_applicant).toBe(
      true,
    );
    expect(
      'release_to_applicant' in buildStepBody(values, kind('decision')),
    ).toBe(false);
  });
});

describe('buildStepBody and reviewer suggestions', () => {
  const values = {
    ...EMPTY_STEP_VALUES,
    name: 'Reviewer suggestions',
    collects_reviewer_suggestions: true,
  };

  it('collects suggestions on a step of evaluator-role holders', () => {
    const body = buildStepBody(
      { ...values, contributor_source: 'proposal_role:4' },
      kind('assessment'),
    );
    expect(body.collects_reviewer_suggestions).toBe(true);
  });

  it('collects none where nobody holds an evaluator role', () => {
    const body = buildStepBody(
      { ...values, contributor_source: 'assigned_reviewers' },
      kind('assessment'),
    );
    expect(body.collects_reviewer_suggestions).toBe(false);
    expect(
      'collects_reviewer_suggestions' in
        buildStepBody(values, kind('decision')),
    ).toBe(false);
  });
});

describe('buildStepBody and lead-only contributors', () => {
  const values = {
    ...EMPTY_STEP_VALUES,
    name: 'Consolidated report',
    contributors_lead_only: true,
  };

  it('limits the contributors of an evaluator role to its lead', () => {
    const body = buildStepBody(
      { ...values, contributor_source: 'proposal_role:4' },
      kind('assessment'),
    );
    expect(body.contributors_lead_only).toBe(true);
  });

  it('sends it off for a source without a lead', () => {
    const body = buildStepBody(
      { ...values, contributor_source: 'call_role:panel_member' },
      kind('assessment'),
    );
    expect(body.contributors_lead_only).toBe(false);
    expect(
      'contributors_lead_only' in buildStepBody(values, kind('decision')),
    ).toBe(false);
  });

  it('reads the setting of a saved step', () => {
    const saved = stepFormValues({
      ...(EMPTY_STEP_VALUES as any),
      kind: 'assessment',
      contributor_source: 'proposal_role:4',
      contributors_lead_only: true,
    });
    expect(saved.contributors_lead_only).toBe(true);
    expect(
      stepFormValues({ kind: 'assessment' } as any).contributors_lead_only,
    ).toBe(false);
  });
});

describe('contributorRole', () => {
  const roles = [
    { uuid: 'aaa', allows_lead: true },
    { uuid: 'bbb', allows_lead: false },
  ];

  it('finds the role a source names by uuid', () => {
    expect(contributorRole('proposal_role:bbb', roles)?.uuid).toBe('bbb');
  });

  it('finds the role a source names by id through the step', () => {
    expect(contributorRole('proposal_role:12', roles, 'aaa')?.uuid).toBe('aaa');
  });

  it('finds none for a source other than an evaluator role', () => {
    expect(contributorRole('call_role:reviewer', roles, 'aaa')).toBeUndefined();
  });
});

describe('the pages of the step dialogs', () => {
  it('has only the first page until a kind is picked', () => {
    expect(stepFormPages(undefined, EMPTY_STEP_VALUES)).toEqual(['basics']);
  });

  it('gives an assessment every page', () => {
    expect(stepFormPages(kind('assessment'), EMPTY_STEP_VALUES)).toEqual([
      'basics',
      'participants',
      'evaluation',
      'inputs',
      'timing',
    ]);
  });

  it('leaves out a page with no field to show', () => {
    const onlyBasics = {
      ...kind('decision'),
      config_fields: ['name', 'description', 'duration_in_days'],
    };
    expect(stepFormPages(onlyBasics, EMPTY_STEP_VALUES)).toEqual([
      'basics',
      'timing',
    ]);
  });

  it('hides the maximum of a step assessed per requested offering', () => {
    expect(
      stepFieldShown('max_contributions', kind('assessment'), {
        ...EMPTY_STEP_VALUES,
        per_requested_offering: true,
      }),
    ).toBe(false);
    expect(
      stepFieldShown(
        'max_contributions',
        kind('assessment'),
        EMPTY_STEP_VALUES,
      ),
    ).toBe(true);
  });

  it('shows allocation timing only on the allocation decision', () => {
    expect(
      stepFieldShown('allocation_time', kind('decision'), EMPTY_STEP_VALUES),
    ).toBe(false);
    expect(
      stepFieldShown('allocation_time', kind('decision'), {
        ...EMPTY_STEP_VALUES,
        is_allocation_decision: true,
      }),
    ).toBe(true);
  });

  it('finds the pages of the fields with errors, in page order', () => {
    const pages = stepFormPages(kind('assessment'), EMPTY_STEP_VALUES);
    expect(
      pagesWithErrors(pages, {
        duration_in_days: 'Too long.',
        name: 'Required',
        criteria: [undefined, { name: 'Required' }],
        min_reviewers: undefined,
        unknown_field: 'Refused.',
      }),
    ).toEqual(['basics', 'evaluation', 'timing']);
  });
});

describe('buildStepBody and automatic decisions', () => {
  const decision = {
    ...EMPTY_STEP_VALUES,
    name: 'Allocation decision',
    is_allocation_decision: true,
    decides_automatically: true,
    transition_mode: 'manual' as const,
  };

  it('sends the flag and an automatic transition for the allocation decision', () => {
    const body = buildStepBody(decision, kind('decision'));
    expect(body.decides_automatically).toBe(true);
    expect(body.transition_mode).toBe('automatic_on_completion');
  });

  it('clears the flag on a decision that does not settle the award', () => {
    const body = buildStepBody(
      { ...decision, is_allocation_decision: false },
      kind('decision'),
    );
    expect(body.decides_automatically).toBe(false);
    expect(body.transition_mode).toBe('manual');
  });

  it('shows the switch on the allocation decision only, and hides the transition mode', () => {
    expect(
      stepFieldShown('decides_automatically', kind('decision'), decision),
    ).toBe(true);
    expect(stepFieldShown('transition_mode', kind('decision'), decision)).toBe(
      false,
    );
    expect(
      stepFieldShown('decides_automatically', kind('decision'), {
        ...decision,
        is_allocation_decision: false,
      }),
    ).toBe(false);
  });
});

describe('who a step hands its slots to', () => {
  const assessment = kind('assessment');

  it('hands per-offering slots to the offering team only', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Technical assessment',
      contributor_source: 'requested_offering_team',
      per_requested_offering: true,
    };
    expect(
      buildStepBody({ ...values, delegable_to: 'offering_team' }, assessment)
        .delegable_to,
    ).toBe('offering_team');
    expect(
      buildStepBody({ ...values, delegable_to: 'proposal_role:r1' }, assessment)
        .delegable_to,
    ).toBe('');
    expect(stepFieldShown('delegable_to', assessment, values)).toBe(true);
  });

  it("hands a person's slot to the holders of an evaluator role", () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Consolidated report',
      contributor_source: 'proposal_role:chair',
    };
    expect(
      buildStepBody({ ...values, delegable_to: 'proposal_role:r1' }, assessment)
        .delegable_to,
    ).toBe('proposal_role:r1');
    expect(
      buildStepBody({ ...values, delegable_to: 'offering_team' }, assessment)
        .delegable_to,
    ).toBe('');
  });

  it('hands nothing on a step whose slots are no one role holder', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Peer review',
      contributor_source: 'assigned_reviewers',
      delegable_to: 'proposal_role:r1',
    };
    expect(stepFieldShown('delegable_to', assessment, values)).toBe(false);
    expect(buildStepBody(values, assessment).delegable_to).toBe('');
  });

  it('names the role by uuid when the backend stored its id', () => {
    const values = stepFormValues({
      kind: 'assessment',
      delegable_to: 'proposal_role:12',
      delegable_proposal_role_uuid: 'r1',
    } as any);
    expect(values.delegable_to).toBe('proposal_role:r1');
  });
});

describe('buildStepBody and change requests', () => {
  const values = {
    ...EMPTY_STEP_VALUES,
    name: 'Administrative check',
    allows_change_requests: true,
  };

  it('lets a decision step send the proposal back', () => {
    expect(buildStepBody(values, kind('decision')).allows_change_requests).toBe(
      true,
    );
  });

  it('never on the allocation decision', () => {
    expect(
      buildStepBody(
        { ...values, is_allocation_decision: true },
        kind('decision'),
      ).allows_change_requests,
    ).toBe(false);
  });
});

describe('conditional acceptance', () => {
  const assessment = kind('assessment');
  const perOffering = {
    ...EMPTY_STEP_VALUES,
    name: 'Technical assessment',
    outcome_set: 'per_offering',
  } as any;

  it('is offered on per-offering outcomes alone', () => {
    expect(
      stepFieldShown('allows_conditional_acceptance', assessment, perOffering),
    ).toBe(true);
    expect(
      stepFieldShown('allows_conditional_acceptance', assessment, {
        ...perOffering,
        outcome_set: 'reviewed',
      }),
    ).toBe(false);
  });

  it('sends a step that takes only accepted or rejected', () => {
    expect(
      buildStepBody(
        { ...perOffering, allows_conditional_acceptance: false },
        assessment,
      ).allows_conditional_acceptance,
    ).toBe(false);
  });

  it('reads the setting back, allowed when the step does not say', () => {
    expect(
      stepFormValues({
        kind: 'assessment',
        allows_conditional_acceptance: false,
      } as any).allows_conditional_acceptance,
    ).toBe(false);
    expect(
      stepFormValues({ kind: 'assessment' } as any)
        .allows_conditional_acceptance,
    ).toBe(true);
  });
});

describe('round_scoped', () => {
  it('sends a step run once per round', () => {
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Panel meeting', round_scoped: true },
      kind('assessment'),
    );
    expect(body.round_scoped).toBe(true);
  });

  it('never makes the allocation decision a round step', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Allocation decision',
      is_allocation_decision: true,
      round_scoped: true,
    };
    expect(buildStepBody(values, kind('decision')).round_scoped).toBe(false);
    expect(stepFieldShown('round_scoped', kind('decision'), values)).toBe(
      false,
    );
  });

  it('is not offered to an assignment step', () => {
    expect(
      stepFieldShown('round_scoped', kind('assignment'), EMPTY_STEP_VALUES),
    ).toBe(false);
  });

  it('reads the flag back from a step', () => {
    expect(stepFormValues({ round_scoped: true } as any).round_scoped).toBe(
      true,
    );
  });

  it('never makes a step after the award a round step', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Final report approval',
      phase: 'closing' as const,
      round_scoped: true,
    };
    const assessment = kind('assessment')!;
    const withPhase = {
      ...assessment,
      config_fields: [...assessment.config_fields, 'phase'],
    };
    expect(buildStepBody(values, withPhase).round_scoped).toBe(false);
    expect(stepFieldShown('round_scoped', withPhase, values)).toBe(false);
  });
});

describe('steps after the award', () => {
  const decision = kind('decision')!;
  const withPhase = {
    ...decision,
    config_fields: [
      ...decision.config_fields,
      'phase',
      'project_end_offset_days',
      'run_condition',
      'allows_change_requests',
    ],
  };

  it('sends the phase and the offset of a post-award step', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Extension decision',
        phase: 'extension',
        project_end_offset_days: 30,
        is_allocation_decision: true,
        allows_change_requests: true,
        run_condition_step: 'administrative_check',
        run_condition_outcomes: ['eligible'],
      },
      withPhase,
    );
    expect(body.phase).toBe('extension');
    expect(body.project_end_offset_days).toBe(30);
    // A post-award step settles no award and runs on every run; it may
    // still send the run back to the team for changes.
    expect(body.is_allocation_decision).toBe(false);
    expect(body.run_condition).toBeNull();
    expect(body.allows_change_requests).toBe(true);
  });

  it('drops the offset of an evaluation step', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Check',
        phase: 'evaluation',
        project_end_offset_days: 5,
      },
      withPhase,
    );
    expect(body.phase).toBe('evaluation');
    expect(body.project_end_offset_days).toBeNull();
  });

  it('shows the offset after the award and the allocation flag before it', () => {
    const extension = { ...EMPTY_STEP_VALUES, phase: 'extension' as const };
    expect(
      stepFieldShown('project_end_offset_days', withPhase, extension),
    ).toBe(true);
    expect(
      stepFieldShown('project_end_offset_days', withPhase, EMPTY_STEP_VALUES),
    ).toBe(false);
    expect(stepFieldShown('is_allocation_decision', withPhase, extension)).toBe(
      false,
    );
  });
});

describe('status labels', () => {
  it('sends the labels trimmed, leaving empty ones out', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Administrative check',
        outcome_set: 'eligibility',
        status_labels: {
          applicant: {
            active: '  Under check ',
            completed: '',
            outcomes: { eligible: 'Under evaluation', ineligible: ' ' },
          },
          evaluators: { active: '' },
        },
      },
      kind('decision'),
    );
    expect(body.status_labels).toEqual({
      applicant: {
        active: 'Under check',
        outcomes: { eligible: 'Under evaluation' },
      },
    });
  });

  it('reads the labels of a saved step', () => {
    const labels = { evaluators: { active: 'Pending assessment' } };
    expect(
      stepFormValues({ status_labels: labels } as any).status_labels,
    ).toEqual(labels);
    expect(stepFormValues({} as any).status_labels).toEqual({});
  });
});

describe('conflict-of-interest declaration', () => {
  const assessment = kind('assessment')!;

  it('is worded only on a step asking for a confirmation', () => {
    const values = {
      ...EMPTY_STEP_VALUES,
      name: 'Review',
      requires_coi_confirmation: true,
      coi_declaration_text: '  No ties to the applicants.  ',
    };
    expect(stepFieldShown('coi_declaration_text', assessment, values)).toBe(
      true,
    );
    expect(buildStepBody(values, assessment).coi_declaration_text).toBe(
      'No ties to the applicants.',
    );
    const without = { ...values, requires_coi_confirmation: false };
    expect(stepFieldShown('coi_declaration_text', assessment, without)).toBe(
      false,
    );
    expect(buildStepBody(without, assessment).coi_declaration_text).toBe('');
  });

  it('reads the stored wording back', () => {
    const values = stepFormValues({
      requires_coi_confirmation: true,
      coi_declaration_text: 'Own words.',
    } as any);
    expect(values.coi_declaration_text).toBe('Own words.');
  });
});

describe('a run condition on how far apart the scores lie', () => {
  const withCondition = {
    ...kind('assessment')!,
    config_fields: [...kind('assessment')!.config_fields, 'run_condition'],
  };
  const values = {
    ...EMPTY_STEP_VALUES,
    name: 'Consensus report',
    run_condition_step: 'expert_evaluation',
    run_condition_kind: 'score_spread' as const,
    run_condition_score_spread: 1,
  };

  it('is sent in place of outcomes', () => {
    expect(buildStepBody(values, withCondition).run_condition).toEqual({
      step: 'expert_evaluation',
      score_spread_above: 1,
    });
    expect(
      runConditionBody({ ...values, run_condition_score_spread: null }),
    ).toBe(null);
    expect(
      runConditionBody({
        ...values,
        run_condition_kind: 'outcomes',
        run_condition_outcomes: ['reviewed'],
      }),
    ).toEqual({ step: 'expert_evaluation', outcomes: ['reviewed'] });
  });

  it('asks for the points, not the outcomes', () => {
    expect(
      stepFieldShown('run_condition_score_spread', withCondition, values),
    ).toBe(true);
    expect(
      stepFieldShown('run_condition_outcomes', withCondition, values),
    ).toBe(false);
    const outcomes = { ...values, run_condition_kind: 'outcomes' as const };
    expect(
      stepFieldShown('run_condition_score_spread', withCondition, outcomes),
    ).toBe(false);
    expect(
      stepFieldShown('run_condition_outcomes', withCondition, outcomes),
    ).toBe(true);
  });

  it('reads a stored spread back', () => {
    const read = stepFormValues({
      run_condition: { step: 'expert_evaluation', score_spread_above: 2 },
    } as any);
    expect(read.run_condition_kind).toBe('score_spread');
    expect(read.run_condition_score_spread).toBe(2);
  });
});
