import { describe, expect, it } from 'vitest';

import { discussionAction } from './discussionAction';

describe('discussionAction', () => {
  it('offers nothing on a step without a discussion for the viewer', () => {
    expect(discussionAction(null, true)).toBeNull();
    expect(discussionAction(undefined, true)).toBeNull();
  });

  it('starts a discussion the viewer may open', () => {
    expect(
      discussionAction({ state: 'not_opened', can_open: true }, true),
    ).toEqual({ kind: 'start' });
  });

  it('says why a discussion not started cannot be started by the viewer', () => {
    const action = discussionAction(
      { state: 'not_opened', can_open: false },
      true,
    );
    expect(action?.kind).toBe('start');
    expect(action).toHaveProperty('disabledReason');
    expect((action as any).disabledReason).toMatch(/step is active/);
  });

  it('opens a discussion under way', () => {
    expect(discussionAction({ state: 'open', can_open: true }, true)).toEqual({
      kind: 'open',
    });
  });

  it('says why an open discussion cannot be opened by the viewer', () => {
    const action = discussionAction({ state: 'open', can_open: false }, true);
    expect(action?.kind).toBe('open');
    expect((action as any).disabledReason).toMatch(/taking part/);
  });

  // A step keeps a dormant discussion while chat is disabled.
  it('offers nothing to start or open while Matrix chat is disabled', () => {
    for (const state of ['not_opened', 'open'] as const) {
      for (const can_open of [true, false]) {
        expect(discussionAction({ state, can_open }, false)).toBeNull();
      }
    }
  });

  it('shows a closed discussion whether or not chat is enabled', () => {
    expect(
      discussionAction({ state: 'closed', can_open: false }, true),
    ).toEqual({ kind: 'closed' });
    expect(
      discussionAction({ state: 'closed', can_open: false }, false),
    ).toEqual({ kind: 'closed' });
  });

  // A step that runs again keeps its closed discussion on record, and
  // opening it starts a new one.
  it('starts a new discussion on a step running again', () => {
    expect(discussionAction({ state: 'closed', can_open: true }, true)).toEqual(
      { kind: 'restart' },
    );
  });

  it('only shows the closed one while Matrix chat is disabled', () => {
    expect(
      discussionAction({ state: 'closed', can_open: true }, false),
    ).toEqual({ kind: 'closed' });
  });
});
