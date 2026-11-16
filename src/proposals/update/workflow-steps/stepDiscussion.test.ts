import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StepKind } from 'waldur-js-client';

import { STEP_KINDS } from '../../workflow/stepKinds.fixture';

import {
  buildStepBody,
  discussionDisabledReason,
  dormantDiscussion,
  EMPTY_STEP_VALUES,
  pageFields,
  stepFieldShown,
  stepFormValues,
  stepSubmissionErrors,
} from './stepForm';

const matrix = vi.hoisted(() => ({ enabled: true }));
vi.mock('@/matrix/utils', () => ({
  isMatrixChatEnabled: () => matrix.enabled,
}));

const DISCUSSION_FIELDS = [
  'has_discussion',
  'discussion_call_managers',
  'discussion_panel_members',
];

// The kinds endpoint lists the discussion settings on every kind but the
// applicant's.
const kind = (id: string): StepKind => {
  const found = STEP_KINDS.find((k) => k.id === id)!;
  return id === 'applicant_action'
    ? found
    : {
        ...found,
        config_fields: [...found.config_fields, ...DISCUSSION_FIELDS],
      };
};

beforeEach(() => {
  matrix.enabled = true;
});

describe('discussionDisabledReason', () => {
  it('allows a discussion on a step that is not blind', () => {
    expect(
      discussionDisabledReason(kind('assessment'), EMPTY_STEP_VALUES),
    ).toBeUndefined();
  });

  it('refuses one on a blind review', () => {
    expect(
      discussionDisabledReason(kind('assessment'), {
        ...EMPTY_STEP_VALUES,
        blind_review: true,
      }),
    ).toMatch(/blind review/);
  });

  it.each([
    { per_requested_offering: true },
    { contributor_source: 'requested_offering_team' },
    { completer: 'offering_manager' as const },
  ])("refuses one on a step of the offerings' teams: %o", (values) => {
    expect(
      discussionDisabledReason(kind('assessment'), {
        ...EMPTY_STEP_VALUES,
        ...values,
      }),
    ).toMatch(/offerings' teams/);
  });

  it("refuses one on the applicant's step", () => {
    expect(
      discussionDisabledReason(kind('applicant_action'), EMPTY_STEP_VALUES),
    ).toMatch(/applicant/);
  });
});

describe('the discussion settings in the step dialogs', () => {
  it('offers a discussion while Matrix chat is enabled', () => {
    expect(
      stepFieldShown('has_discussion', kind('assessment'), EMPTY_STEP_VALUES),
    ).toBe(true);
  });

  it('offers none while Matrix chat is disabled', () => {
    matrix.enabled = false;
    expect(
      stepFieldShown('has_discussion', kind('assessment'), EMPTY_STEP_VALUES),
    ).toBe(false);
  });

  it("offers none on the applicant's step, whose kind lacks it", () => {
    expect(
      stepFieldShown(
        'has_discussion',
        kind('applicant_action'),
        EMPTY_STEP_VALUES,
      ),
    ).toBe(false);
  });

  it('shows who joins only once the step has a discussion', () => {
    const values = { ...EMPTY_STEP_VALUES, has_discussion: true };
    expect(
      stepFieldShown(
        'discussion_call_managers',
        kind('decision'),
        EMPTY_STEP_VALUES,
      ),
    ).toBe(false);
    expect(
      stepFieldShown('discussion_call_managers', kind('decision'), values),
    ).toBe(true);
    expect(
      stepFieldShown('discussion_panel_members', kind('decision'), values),
    ).toBe(true);
  });

  it('hides who joins on a blind review, which cannot have one', () => {
    expect(
      stepFieldShown('discussion_panel_members', kind('assessment'), {
        ...EMPTY_STEP_VALUES,
        has_discussion: true,
        blind_review: true,
      }),
    ).toBe(false);
  });
});

describe('buildStepBody and discussions', () => {
  it('starts a new step without a discussion, call managers observing', () => {
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Panel' },
      kind('decision'),
    );
    expect(body).toMatchObject({
      has_discussion: false,
      discussion_call_managers: true,
      discussion_panel_members: false,
    });
  });

  it('sends the discussion settings chosen', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Panel',
        has_discussion: true,
        discussion_call_managers: false,
        discussion_panel_members: true,
      },
      kind('decision'),
    );
    expect(body).toMatchObject({
      has_discussion: true,
      discussion_call_managers: false,
      discussion_panel_members: true,
    });
  });

  it('saves a blind review without a discussion', () => {
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Review',
        blind_review: true,
        has_discussion: true,
      },
      kind('assessment'),
    );
    expect(body.blind_review).toBe(true);
    expect(body.has_discussion).toBe(false);
  });

  it('leaves the settings alone while Matrix chat is disabled', () => {
    matrix.enabled = false;
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Panel', has_discussion: true },
      kind('decision'),
    );
    expect(body).not.toHaveProperty('has_discussion');
    expect(body).not.toHaveProperty('discussion_call_managers');
    expect(body).not.toHaveProperty('discussion_panel_members');
  });

  // The backend refuses a blind step with a discussion, chat or not: with the
  // switch hidden, the manager could not save it otherwise.
  it('drops the discussion of a step made blind while Matrix chat is disabled', () => {
    matrix.enabled = false;
    const body = buildStepBody(
      {
        ...EMPTY_STEP_VALUES,
        name: 'Review',
        blind_review: true,
        has_discussion: true,
      },
      kind('assessment'),
    );
    expect(body.blind_review).toBe(true);
    expect(body.has_discussion).toBe(false);
    expect(body).not.toHaveProperty('discussion_call_managers');
    expect(body).not.toHaveProperty('discussion_panel_members');
  });

  it('sends no discussion on the applicant step, whose kind lacks it', () => {
    matrix.enabled = false;
    const body = buildStepBody(
      { ...EMPTY_STEP_VALUES, name: 'Accept' },
      kind('applicant_action'),
    );
    expect(body).not.toHaveProperty('has_discussion');
  });

  it("reads a step's discussion settings into the form", () => {
    const values = stepFormValues({
      kind: 'decision',
      name: 'Panel',
      has_discussion: true,
      discussion_call_managers: false,
      discussion_panel_members: true,
    } as any);
    expect(values).toMatchObject({
      has_discussion: true,
      discussion_call_managers: false,
      discussion_panel_members: true,
    });
  });
});

describe('a refused discussion', () => {
  it("shows the backend's refusal under the switch", () => {
    const errors = stepSubmissionErrors({
      status: 400,
      data: {
        has_discussion: [
          'Matrix chat is disabled, so a step cannot be given a discussion.',
        ],
      },
    });
    expect(errors?.has_discussion).toBe(
      'Matrix chat is disabled, so a step cannot be given a discussion.',
    );
  });
});

describe('the discussion on the check page', () => {
  const evaluation = (values: typeof EMPTY_STEP_VALUES) =>
    pageFields('evaluation', kind('assessment'), values);

  it('lists the discussion dropped from a step made blind with chat disabled', () => {
    matrix.enabled = false;
    const values = { ...EMPTY_STEP_VALUES, blind_review: true };
    expect(evaluation(values)).toContain('has_discussion');
    expect(buildStepBody(values, kind('assessment'))).toHaveProperty(
      'has_discussion',
      false,
    );
  });

  it('lists none it does not send while chat is disabled', () => {
    matrix.enabled = false;
    const values = { ...EMPTY_STEP_VALUES, has_discussion: true };
    expect(evaluation(values)).not.toContain('has_discussion');
    expect(buildStepBody(values, kind('assessment'))).not.toHaveProperty(
      'has_discussion',
    );
  });

  it('lists the discussion while chat is enabled', () => {
    expect(evaluation(EMPTY_STEP_VALUES)).toContain('has_discussion');
  });
});

describe('a dormant discussion, kept while Matrix chat is disabled', () => {
  const dormant = {
    ...EMPTY_STEP_VALUES,
    name: 'Review',
    has_discussion: true,
    saved_has_discussion: true,
  };

  beforeEach(() => {
    matrix.enabled = false;
  });

  it('is one the saved step has, while chat is disabled', () => {
    expect(dormantDiscussion(kind('assessment'), dormant)).toBe(true);
    expect(
      dormantDiscussion(kind('assessment'), {
        ...dormant,
        saved_has_discussion: false,
      }),
    ).toBe(false);
    matrix.enabled = true;
    expect(dormantDiscussion(kind('assessment'), dormant)).toBe(false);
  });

  it('shows the switch, to switch it off', () => {
    expect(stepFieldShown('has_discussion', kind('assessment'), dormant)).toBe(
      true,
    );
    expect(
      stepFieldShown('discussion_call_managers', kind('assessment'), dormant),
    ).toBe(false);
  });

  it('sends and lists it switched off, and nothing while left on', () => {
    const off = { ...dormant, has_discussion: false };
    expect(buildStepBody(off, kind('assessment')).has_discussion).toBe(false);
    expect(pageFields('evaluation', kind('assessment'), off)).toContain(
      'has_discussion',
    );
    expect(buildStepBody(dormant, kind('assessment'))).not.toHaveProperty(
      'has_discussion',
    );
    expect(pageFields('evaluation', kind('assessment'), dormant)).not.toContain(
      'has_discussion',
    );
  });

  it('reads the saved discussion into the form', () => {
    expect(
      stepFormValues({ kind: 'assessment', has_discussion: true } as any)
        .saved_has_discussion,
    ).toBe(true);
  });
});
