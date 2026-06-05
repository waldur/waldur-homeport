import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { MatrixChatMessage } from './types';
import {
  aggregateReactions,
  aggregateReactionsForTarget,
  getSenderName,
  htmlToPlainText,
  resolveMemberName,
  sanitizeName,
} from './utils';

// @/core/config is mocked globally (test/setupTests.js); override just the
// value the bot-name path reads so the assertion below is whitelabel-specific.
ENV.plugins.WALDUR_CORE.SITE_NAME = 'Acme';

const message: MatrixChatMessage = {
  eventId: 'e1',
  sender: '@robin:waldur.example.com',
  senderDisplayName: 'robin 💕',
  body: 'hi',
  timestamp: 0,
  type: 'm.text',
};

describe('getSenderName', () => {
  it('returns the Waldur full name when the sender is a known room member', () => {
    const names = new Map([['@robin:waldur.example.com', 'Robin Hood']]);
    expect(getSenderName(message, names)).toBe('Robin Hood');
  });

  it('falls back to the sanitized Matrix display name when the sender is not a Waldur member', () => {
    expect(getSenderName(message, new Map())).toBe('robin');
  });
});

describe('resolveMemberName', () => {
  const userId = '@robin:waldur.example.com';

  it('returns the Waldur full name when the user is a known member', () => {
    const names = new Map([[userId, 'Robin Hood']]);
    expect(resolveMemberName(userId, names, 'robin 💕')).toBe('Robin Hood');
  });

  it('falls back to the sanitized Matrix name for non-Waldur users', () => {
    expect(resolveMemberName(userId, new Map(), 'robin 💕')).toBe('robin');
  });

  it('humanizes the localpart when there is no Matrix name', () => {
    expect(resolveMemberName('@john.doe:waldur.example.com', new Map())).toBe(
      'John Doe',
    );
  });

  it('humanizes the localpart when the Matrix name is only emoji', () => {
    expect(
      resolveMemberName('@john.doe:waldur.example.com', new Map(), '💕💕'),
    ).toBe('John Doe');
  });

  it('uses the SITE_NAME-derived bot name when the localpart looks like a bot', () => {
    // matrix-js-sdk's RoomMember.name returns the raw user ID when no display
    // name is set — e.g. the appservice bot before it is renamed. We must not
    // surface "Waldur Bot" on whitelabel deployments, so any `*-bot` localpart
    // resolves to `${SITE_NAME} Bot` instead of being humanized.
    expect(
      resolveMemberName(
        '@waldur-bot:localhost',
        new Map(),
        '@waldur-bot:localhost',
      ),
    ).toBe('Acme Bot');
  });
});

describe('sanitizeName', () => {
  it('strips emoji and collapses the leftover whitespace', () => {
    expect(sanitizeName('robin 💕')).toBe('robin');
    expect(sanitizeName('hendrik 💕 jaks')).toBe('hendrik jaks');
  });

  it('leaves a plain name untouched', () => {
    expect(sanitizeName('Robin Hood')).toBe('Robin Hood');
  });

  it('keeps initials derivable — first letters survive', () => {
    expect(sanitizeName('💕 Robin Hood').charAt(0)).toBe('R');
  });
});

describe('htmlToPlainText', () => {
  it('strips tags from a formatted_body preview', () => {
    expect(htmlToPlainText('<p><strong>Room members (2):</strong></p>')).toBe(
      'Room members (2):',
    );
  });

  it('decodes entities and collapses whitespace across blocks', () => {
    expect(
      htmlToPlainText(
        '<p><strong>Members:</strong></p>\n<ul>\n<li><code>a&lt;b</code> — bot</li>\n</ul>',
      ),
    ).toBe('Members: a<b — bot');
  });

  it('does not execute embedded scripts, only extracts text', () => {
    expect(htmlToPlainText('<p>hi<script>alert(1)</script></p>')).toBe(
      'hialert(1)',
    );
  });

  it('returns empty string for empty input', () => {
    expect(htmlToPlainText('')).toBe('');
  });
});

// Minimal mock MatrixEvent shape — only the fields aggregateReactions reads.
function reactionEvent(opts: {
  eventId: string;
  sender: string;
  target: string;
  key: string;
  redacted?: boolean;
}) {
  return {
    getType: () => 'm.reaction',
    getId: () => opts.eventId,
    getSender: () => opts.sender,
    getContent: () => ({
      'm.relates_to': {
        rel_type: 'm.annotation',
        event_id: opts.target,
        key: opts.key,
      },
    }),
    isRedacted: () => Boolean(opts.redacted),
  } as any;
}

function nonReactionEvent() {
  return {
    getType: () => 'm.room.message',
    getId: () => 'msg-1',
    getSender: () => '@a:s',
    getContent: () => ({ body: 'hi' }),
    isRedacted: () => false,
  } as any;
}

describe('aggregateReactions', () => {
  const me = '@me:server';

  it('returns empty maps when there are no events', () => {
    const result = aggregateReactions([], me);
    expect(result.aggregates.size).toBe(0);
    expect(result.reactors.size).toBe(0);
  });

  it('ignores non-reaction events', () => {
    const result = aggregateReactions([nonReactionEvent()], me);
    expect(result.aggregates.size).toBe(0);
  });

  it('aggregates a single reaction', () => {
    const events = [
      reactionEvent({
        eventId: 'r1',
        sender: '@alice:s',
        target: 'm1',
        key: '👍',
      }),
    ];
    const result = aggregateReactions(events, me);
    expect(result.aggregates.get('m1')).toEqual([
      { key: '👍', count: 1, reactedByMe: false, myEventId: undefined },
    ]);
  });

  it('groups multiple same-key reactions on the same target', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r2', sender: '@b:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r3', sender: '@c:s', target: 'm1', key: '👍' }),
    ];
    const result = aggregateReactions(events, me);
    expect(result.aggregates.get('m1')).toEqual([
      { key: '👍', count: 3, reactedByMe: false, myEventId: undefined },
    ]);
  });

  it('produces separate aggregates per key on the same target', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r2', sender: '@a:s', target: 'm1', key: '🎉' }),
    ];
    const result = aggregateReactions(events, me);
    const aggregates = result.aggregates.get('m1');
    expect(aggregates).toHaveLength(2);
    expect(aggregates).toContainEqual({
      key: '👍',
      count: 1,
      reactedByMe: false,
      myEventId: undefined,
    });
    expect(aggregates).toContainEqual({
      key: '🎉',
      count: 1,
      reactedByMe: false,
      myEventId: undefined,
    });
  });

  it('flags reactedByMe and captures myEventId when the current user reacted', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'mine', sender: me, target: 'm1', key: '👍' }),
    ];
    const result = aggregateReactions(events, me);
    expect(result.aggregates.get('m1')).toEqual([
      { key: '👍', count: 2, reactedByMe: true, myEventId: 'mine' },
    ]);
  });

  it('excludes redacted reactions', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({
        eventId: 'r2',
        sender: '@b:s',
        target: 'm1',
        key: '👍',
        redacted: true,
      }),
    ];
    const result = aggregateReactions(events, me);
    expect(result.aggregates.get('m1')).toEqual([
      { key: '👍', count: 1, reactedByMe: false, myEventId: undefined },
    ]);
  });

  it('collects reactor user_ids per key', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r2', sender: '@b:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r3', sender: '@a:s', target: 'm1', key: '🎉' }),
    ];
    const result = aggregateReactions(events, me);
    expect(result.reactors.get('m1')).toEqual({
      '👍': ['@a:s', '@b:s'],
      '🎉': ['@a:s'],
    });
  });
});

describe('aggregateReactionsForTarget', () => {
  const me = '@me:server';

  it('returns empty result when there are no events', () => {
    const result = aggregateReactionsForTarget([], 'm1', me);
    expect(result.reactions).toEqual([]);
    expect(result.reactors).toEqual({});
  });

  it('ignores reactions targeting a different message', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm2', key: '👍' }),
    ];
    const result = aggregateReactionsForTarget(events, 'm1', me);
    expect(result.reactions).toEqual([]);
    expect(result.reactors).toEqual({});
  });

  it('ignores non-reaction events', () => {
    const result = aggregateReactionsForTarget(
      [nonReactionEvent()],
      'msg-1',
      me,
    );
    expect(result.reactions).toEqual([]);
  });

  it('aggregates a single reaction on the target', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
    ];
    const result = aggregateReactionsForTarget(events, 'm1', me);
    expect(result.reactions).toEqual([
      { key: '👍', count: 1, reactedByMe: false, myEventId: undefined },
    ]);
  });

  it('groups multiple same-key reactions on the target', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r2', sender: '@b:s', target: 'm1', key: '👍' }),
      // Different target — must be ignored.
      reactionEvent({ eventId: 'r3', sender: '@c:s', target: 'm2', key: '👍' }),
    ];
    const result = aggregateReactionsForTarget(events, 'm1', me);
    expect(result.reactions).toEqual([
      { key: '👍', count: 2, reactedByMe: false, myEventId: undefined },
    ]);
  });

  it('flags reactedByMe and captures myEventId for the current user', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'mine', sender: me, target: 'm1', key: '👍' }),
    ];
    const result = aggregateReactionsForTarget(events, 'm1', me);
    expect(result.reactions).toEqual([
      { key: '👍', count: 2, reactedByMe: true, myEventId: 'mine' },
    ]);
  });

  it('excludes redacted reactions', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({
        eventId: 'r2',
        sender: '@b:s',
        target: 'm1',
        key: '👍',
        redacted: true,
      }),
    ];
    const result = aggregateReactionsForTarget(events, 'm1', me);
    expect(result.reactions).toEqual([
      { key: '👍', count: 1, reactedByMe: false, myEventId: undefined },
    ]);
  });

  it('collects reactor user_ids per key for the target', () => {
    const events = [
      reactionEvent({ eventId: 'r1', sender: '@a:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r2', sender: '@b:s', target: 'm1', key: '👍' }),
      reactionEvent({ eventId: 'r3', sender: '@a:s', target: 'm1', key: '🎉' }),
      // Different target — reactor must not appear in the result.
      reactionEvent({ eventId: 'r4', sender: '@z:s', target: 'm2', key: '👍' }),
    ];
    const result = aggregateReactionsForTarget(events, 'm1', me);
    expect(result.reactors).toEqual({
      '👍': ['@a:s', '@b:s'],
      '🎉': ['@a:s'],
    });
  });
});
