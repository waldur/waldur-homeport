import { describe, expect, it } from 'vitest';
import { RoundStep } from 'waldur-js-client';

import {
  getLaggingRefusal,
  roundStepState,
  shownRoundDiscussions,
  toIsoDate,
} from './roundSteps';

const step = (values: Partial<RoundStep>): RoundStep => ({
  round_step_uuid: null,
  has_discussion: false,
  discussions: [],
  step_uuid: 's1',
  step_key: 'meeting',
  step_name: 'Panel meeting',
  step_kind: 'assessment',
  order: 1,
  round_scoped: true,
  has_reports: true,
  due_at: null,
  opened_at: null,
  proposals_at_step: 0,
  proposals_before_step: 0,
  proposals_awaiting_advance: 0,
  reports_total: 0,
  reports_submitted: 0,
  ...values,
});

describe('roundStepState', () => {
  it('counts the proposals waiting for a round step to open', () => {
    expect(roundStepState(step({ proposals_at_step: 3 }))).toBe(
      'Not opened: 3 proposal(s) waiting',
    );
  });

  it('counts the reports of an opened round step', () => {
    expect(
      roundStepState(
        step({
          opened_at: '2026-10-01T00:00:00Z',
          reports_total: 5,
          reports_submitted: 2,
        }),
      ),
    ).toBe('Open: 2 of 5 report(s) submitted');
  });

  it('says what waits after an ordinary step, and nothing else', () => {
    expect(
      roundStepState(
        step({ round_scoped: false, proposals_awaiting_advance: 4 }),
      ),
    ).toBe('4 waiting to be moved on');
    expect(roundStepState(step({ round_scoped: false }))).toBe('');
  });
});

describe('getLaggingRefusal', () => {
  it('reads the count of proposals behind the step from a refusal', () => {
    expect(
      getLaggingRefusal({
        status: 400,
        lagging_count: 2,
        detail: 'Not yet',
      }),
    ).toEqual({ count: 2, detail: 'Not yet' });
  });

  it('ignores any other error', () => {
    expect(getLaggingRefusal({ status: 400, detail: 'Other' })).toBeNull();
    expect(getLaggingRefusal({ status: 403 })).toBeNull();
  });
});

describe('toIsoDate', () => {
  it('sends a date as ISO and nothing as null', () => {
    expect(toIsoDate(new Date('2026-10-12T10:00:00Z'))).toBe(
      '2026-10-12T10:00:00.000Z',
    );
    expect(toIsoDate(null)).toBeNull();
  });
});

describe('shownRoundDiscussions', () => {
  const discussion = (panel: string, state: string, can_open = true) =>
    ({
      uuid: state === 'not_opened' ? null : `d-${panel}`,
      state,
      can_open,
      panel_uuid: panel,
      panel_name: panel,
    }) as any;
  const withPanels = step({
    round_step_uuid: 'rs1',
    has_discussion: true,
    discussions: [
      discussion('a', 'not_opened'),
      discussion('b', 'open'),
      discussion('c', 'closed'),
    ],
  });

  it("shows each panel's discussion while Matrix chat is enabled", () => {
    expect(
      shownRoundDiscussions(withPanels, true).map((d) => d.panel_uuid),
    ).toEqual(['a', 'b', 'c']);
  });

  it('shows only the closed ones while Matrix chat is disabled', () => {
    expect(
      shownRoundDiscussions(withPanels, false).map((d) => d.panel_uuid),
    ).toEqual(['c']);
  });

  it('shows none before the round step opens', () => {
    expect(
      shownRoundDiscussions({ ...withPanels, round_step_uuid: null }, true),
    ).toEqual([]);
  });
});
