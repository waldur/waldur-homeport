import { describe, expect, it } from 'vitest';

import { stepsWithDiscussion } from './StepDiscussionsSection';

const step = (uuid: string, discussion) =>
  ({ uuid, step_name: uuid, discussion }) as any;

const steps = [
  step('none', null),
  step('not-started', { uuid: null, state: 'not_opened', can_open: true }),
  step('open', { uuid: 'd-open', state: 'open', can_open: true }),
  step('closed', { uuid: 'd-closed', state: 'closed', can_open: false }),
];

const uuids = (rows) => rows.map((row) => row.uuid);

describe('stepsWithDiscussion', () => {
  it('lists every step with a discussion while Matrix chat is enabled', () => {
    expect(uuids(stepsWithDiscussion(steps, true))).toEqual([
      'not-started',
      'open',
      'closed',
    ]);
  });

  // A step may keep a dormant discussion while chat is disabled.
  it("lists only closed discussions' records while Matrix chat is disabled", () => {
    expect(uuids(stepsWithDiscussion(steps, false))).toEqual(['closed']);
  });

  it('lists nothing, so no section, with chat disabled and no closed discussion', () => {
    expect(stepsWithDiscussion(steps.slice(0, 3), false)).toEqual([]);
  });
});
