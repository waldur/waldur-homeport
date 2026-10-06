import { describe, expect, it } from 'vitest';

import {
  canViewRoundAdoption,
  getHeldDecisionsRefusal,
  getRoundLifecycleActions,
  heldDecisionLabel,
  getEffectiveCompletionRule,
  getUndecidedRefusal,
} from './roundLifecycle';

describe('getRoundLifecycleActions', () => {
  it('lets an open round be closed early, and nothing else', () => {
    expect(
      getRoundLifecycleActions({ status: 'open', lifecycle_state: null }),
    ).toEqual({
      close: true,
      startDeciding: false,
      publishResults: false,
      complete: false,
      completionRule: true,
      recordAdoption: false,
    });
  });

  it('offers only the completion rule for a round that has not started', () => {
    for (const status of ['scheduled'] as const) {
      expect(
        getRoundLifecycleActions({ status, lifecycle_state: null }),
      ).toEqual({
        close: false,
        startDeciding: false,
        publishResults: false,
        complete: false,
        completionRule: true,
        recordAdoption: false,
      });
    }
  });

  it('lets an evaluating round start deciding or publish straight away', () => {
    expect(
      getRoundLifecycleActions({
        status: 'ended',
        lifecycle_state: 'evaluating',
      }),
    ).toEqual({
      close: false,
      startDeciding: true,
      publishResults: true,
      complete: false,
      completionRule: true,
      recordAdoption: true,
    });
  });

  it('treats an ended round the sweep has not reached as evaluating', () => {
    expect(
      getRoundLifecycleActions({ status: 'ended', lifecycle_state: null }),
    ).toMatchObject({ startDeciding: true, publishResults: true });
  });

  it('lets a deciding round publish its results only', () => {
    expect(
      getRoundLifecycleActions({
        status: 'ended',
        lifecycle_state: 'deciding',
      }),
    ).toEqual({
      close: false,
      startDeciding: false,
      publishResults: true,
      complete: false,
      completionRule: true,
      recordAdoption: true,
    });
  });

  it('publishes again while decisions of a published round are still held', () => {
    expect(
      getRoundLifecycleActions({
        status: 'ended',
        lifecycle_state: 'results_published',
        held_decisions_count: 2,
      }),
    ).toMatchObject({ publishResults: true, complete: true });
  });

  it('lets a round with published results be completed', () => {
    expect(
      getRoundLifecycleActions({
        status: 'ended',
        lifecycle_state: 'results_published',
      }),
    ).toEqual({
      close: false,
      startDeciding: false,
      publishResults: false,
      complete: true,
      completionRule: true,
      recordAdoption: true,
    });
  });

  it('leaves a closed round with the adoption record alone', () => {
    expect(
      getRoundLifecycleActions({ status: 'ended', lifecycle_state: 'closed' }),
    ).toEqual({
      close: false,
      startDeciding: false,
      publishResults: false,
      complete: false,
      completionRule: false,
      recordAdoption: true,
    });
  });
});

describe('getEffectiveCompletionRule', () => {
  it("uses the round's own rule where it sets one", () => {
    expect(
      getEffectiveCompletionRule(
        { undecided_at_round_completion: 'reject' },
        { undecided_at_round_completion: 'refuse' },
      ),
    ).toEqual({ rule: 'reject', inherited: false });
  });

  it("falls back to the call's rule, and to refusing", () => {
    expect(
      getEffectiveCompletionRule(
        { undecided_at_round_completion: null },
        { undecided_at_round_completion: 'reject' },
      ),
    ).toEqual({ rule: 'reject', inherited: true });
    expect(
      getEffectiveCompletionRule({ undecided_at_round_completion: '' }, {}),
    ).toEqual({ rule: 'refuse', inherited: true });
  });
});

describe('heldDecisionLabel', () => {
  it('names the tentative outcome', () => {
    expect(heldDecisionLabel('approved')).toBe('Awarded (tentative)');
    expect(heldDecisionLabel('declined')).toBe('Not awarded (tentative)');
    expect(heldDecisionLabel('rejected')).toBe('Not awarded (tentative)');
  });

  it('falls back while the outcome is not loaded', () => {
    expect(heldDecisionLabel(undefined)).toBe('Decision held');
  });
});

// What the SDK client throws: waldur-auth-core's error interceptor spreads a
// JSON object body onto the error (an array body by index) and adds the
// response envelope alongside it.
const thrown = (status: number, body: object) => ({
  ...body,
  response: { status } as Response,
  status,
  statusText: 'Bad Request',
  url: 'http://localhost/api/publish_results/',
});

describe('getUndecidedRefusal', () => {
  it('reads the undecided count from the backend refusal', () => {
    expect(
      getUndecidedRefusal(
        thrown(400, { detail: 'Decide them first.', undecided_count: 4 }),
      ),
    ).toEqual({ count: 4, detail: 'Decide them first.' });
  });

  it('ignores a refusal for another reason', () => {
    expect(
      getUndecidedRefusal(
        thrown(400, ['The round is Closed, so this step does not apply.']),
      ),
    ).toBeNull();
    expect(
      getUndecidedRefusal(thrown(400, { reason: ['A reason is required.'] })),
    ).toBeNull();
    expect(getUndecidedRefusal(thrown(403, { undecided_count: 1 }))).toBeNull();
  });
});

describe('getHeldDecisionsRefusal', () => {
  it('reads the held count from the completion refusal', () => {
    expect(
      getHeldDecisionsRefusal(
        thrown(400, {
          detail: 'Publish again first.',
          held_decisions_count: 2,
        }),
      ),
    ).toEqual({ count: 2, detail: 'Publish again first.' });
  });

  it('ignores an undecided refusal and other statuses', () => {
    expect(
      getHeldDecisionsRefusal(
        thrown(400, { detail: 'Decide them first.', undecided_count: 4 }),
      ),
    ).toBeNull();
    expect(
      getHeldDecisionsRefusal(thrown(409, { held_decisions_count: 1 })),
    ).toBeNull();
  });
});

describe('canViewRoundAdoption', () => {
  it('hides the record while a round withholds it from the viewer', () => {
    expect(
      canViewRoundAdoption(
        { lifecycle_state: 'deciding', held_decisions_count: null },
        { publish_results: 'with_round' },
      ),
    ).toBe(false);
  });

  it('shows it to viewers who may see held decisions', () => {
    expect(
      canViewRoundAdoption(
        { lifecycle_state: 'deciding', held_decisions_count: 0 },
        { publish_results: 'with_round' },
      ),
    ).toBe(true);
  });

  it('shows it to everyone once results are published or closed', () => {
    for (const lifecycle_state of ['results_published', 'closed'] as const) {
      expect(
        canViewRoundAdoption({ lifecycle_state, held_decisions_count: null }),
      ).toBe(true);
    }
  });

  it('shows it to everyone when each decision is announced at once', () => {
    expect(
      canViewRoundAdoption(
        { lifecycle_state: 'deciding', held_decisions_count: null },
        { publish_results: 'immediately' },
      ),
    ).toBe(true);
  });
});
