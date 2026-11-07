import { describe, expect, it } from 'vitest';

import {
  actionsBeforeStep,
  actionsUpTo,
  coverageCounts,
  dryRunRequest,
  EMPTY_COVERAGE,
  mergeCoverage,
  stepRowKey,
  stepRunLabel,
  stepStatusLabel,
  untried,
} from './dryRun';

const actions = [
  { step: 'check', outcome: 'eligible' },
  { step: 'assessment', outcome: 'feasible' },
  { step: 'decision', outcome: 'approved' },
];

const entry = (action: number | null, kind = 'completed', step = 'check') =>
  ({ action, kind, step }) as any;

describe('dry run path', () => {
  it('sends the whole path and only what is chosen', () => {
    expect(dryRunRequest(actions, null, null)).toEqual({ actions });
    expect(dryRunRequest([], ['o1'], { role: 'applicant' })).toEqual({
      actions: [],
      requested_offerings: ['o1'],
      view_as: { role: 'applicant', offering: null },
    });
  });

  it('rewinds to a log entry: the actions that led to it', () => {
    expect(actionsUpTo(actions, entry(null))).toEqual([]);
    expect(actionsUpTo(actions, entry(0))).toEqual(actions.slice(0, 1));
    expect(actionsUpTo(actions, entry(2))).toEqual(actions);
  });

  it('rewinds to a step: as the proposal stood when it started', () => {
    const log = [
      entry(null, 'started', 'check'),
      entry(0, 'completed', 'check'),
      entry(0, 'started', 'assessment'),
    ];
    expect(actionsBeforeStep(actions, log, 'check')).toEqual([]);
    expect(actionsBeforeStep(actions, log, 'assessment')).toEqual(
      actions.slice(0, 1),
    );
    expect(actionsBeforeStep(actions, log, 'decision')).toBeNull();
  });
});

describe('coverage over a session', () => {
  const run = (tried: string[], exercised: string[]) =>
    ({
      steps: ['check', 'decision'],
      exercised,
      outcomes: {
        check: { available: ['eligible', 'ineligible'], tried },
        decision: { available: ['approved', 'declined'], tried: [] },
      },
      contribution_outcomes: {},
    }) as any;

  it('accumulates what each run tried', () => {
    const first = mergeCoverage(EMPTY_COVERAGE, run(['eligible'], ['check']));
    const second = mergeCoverage(first, run(['ineligible'], ['check']));
    expect(second.outcomes.check.tried).toEqual(['eligible', 'ineligible']);
    expect(coverageCounts(second)).toEqual({
      steps: 2,
      exercised: 1,
      outcomes: 4,
      outcomesTried: 2,
    });
    expect(untried(second, { decision: 'Decision' })).toEqual([
      'Decision = approved',
      'Decision = declined',
    ]);
  });
});

describe('steps after the award', () => {
  it('names the run a step belongs to and keeps each row apart', () => {
    expect(stepRunLabel({ phase: 'extension', run: 2 })).toBe(
      'Extension request 2',
    );
    expect(stepRunLabel({ phase: 'closing', run: 3 })).toBe('Final report');
    expect(stepRunLabel({ phase: 'evaluation', run: null })).toBeNull();
    expect(stepRowKey({ key: 'extension_request', run: 2 })).toBe(
      'extension_request#2',
    );
    expect(stepRowKey({ key: 'administrative_check', run: null })).toBe(
      'administrative_check',
    );
  });
});

describe('step status', () => {
  const step = (status: string, phase = 'evaluation') =>
    ({ status, phase, automatic: false }) as any;

  it('says a step the ended proposal never reaches is not reached', () => {
    expect(stepStatusLabel(step('pending'), 'rejected')).toBe('Not reached');
    expect(stepStatusLabel(step('pending'), 'canceled')).toBe('Not reached');
    expect(stepStatusLabel(step('pending'), 'accepted')).toBe('Not reached');
    // What the engine itself says of a step stays.
    expect(stepStatusLabel(step('withdrawn'), 'rejected')).toBe('Withdrawn');
    expect(stepStatusLabel(step('skipped'), 'rejected')).toBe('Disabled');
  });

  it('keeps a step still to come pending', () => {
    expect(stepStatusLabel(step('pending'), 'in_review')).toBe('Pending');
    // An accepted proposal may still ask for an extension.
    expect(stepStatusLabel(step('pending', 'extension'), 'accepted')).toBe(
      'Pending',
    );
  });
});
