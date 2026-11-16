import { describe, expect, it } from 'vitest';

import { isDiscussionRoom, roomTitle } from './roomKind';

describe('roomTitle', () => {
  it('leaves a project room as named', () => {
    expect(roomTitle('Climate project', 'project', 'Acme')).toEqual({
      title: 'Climate project',
    });
  });

  it('names a discussion by its step and panel, with its call beside', () => {
    expect(
      roomTitle(
        'Regular Access · Panel meeting · Round 1 · Physics',
        'step_discussion',
        'Panel meeting · Round 1 · Physics',
      ),
    ).toEqual({
      title: 'Panel meeting · Round 1 · Physics',
      context: 'Regular Access',
    });
  });

  it('keeps a renamed discussion room name, with its subtitle beside', () => {
    expect(
      roomTitle('Our panel room', 'step_discussion', 'Panel meeting'),
    ).toEqual({ title: 'Our panel room', context: 'Panel meeting' });
  });

  it('tells discussion rooms apart', () => {
    expect(isDiscussionRoom('step_discussion')).toBe(true);
    expect(isDiscussionRoom('project')).toBe(false);
    expect(isDiscussionRoom(null)).toBe(false);
  });
});
