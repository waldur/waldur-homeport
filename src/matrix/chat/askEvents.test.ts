import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAskKind, isWelcome } from './askEvents';

const ME = '@me:example.org';

const BOT = '@assistant:example.org';

const makeEvent = ({
  sender = '@alice:example.org',
  type = 'm.room.message',
  redacted = false,
  content = { body: 'hi', 'm.mentions': { user_ids: [ME] } } as any,
} = {}) =>
  ({
    getSender: () => sender,
    getType: () => type,
    isRedacted: () => redacted,
    getContent: () => content,
  }) as any;

const WELCOME_CONTENT = {
  body: "**Welcome to this project's team chat!**",
  'm.mentions': {},
  'com.waldur.welcome': true,
};

describe('getAskKind', () => {
  let client: any;

  beforeEach(() => {
    client = {
      getPushActionsForEvent: vi.fn(() => ({
        notify: true,
        tweaks: { highlight: true },
      })),
    };
  });

  it('is a mention when highlighted and I am in m.mentions', () => {
    expect(getAskKind(client, makeEvent(), ME)).toBe('mention');
  });

  it('is a room ask for an @room highlight', () => {
    const event = makeEvent({
      content: { body: '@room hi', 'm.mentions': { room: true } },
    });
    expect(getAskKind(client, event, ME)).toBe('room');
  });

  // Being named in the same message is the more personal ask.
  it('is a mention when an @room message also names me', () => {
    const event = makeEvent({
      content: { body: 'hi', 'm.mentions': { room: true, user_ids: [ME] } },
    });
    expect(getAskKind(client, event, ME)).toBe('mention');
  });

  // m.mentions is the sender's JSON, so a crafted client can send anything.
  it.each([5, {}, true, 'x'])(
    'is a room ask when user_ids is not an array (%j)',
    (userIds) => {
      const event = makeEvent({
        content: { body: 'x', 'm.mentions': { room: true, user_ids: userIds } },
      });
      expect(getAskKind(client, event, ME)).toBe('room');
    },
  );

  it('ignores my own messages', () => {
    expect(getAskKind(client, makeEvent({ sender: ME }), ME)).toBeNull();
  });

  it('ignores the bot', () => {
    const event = makeEvent({ sender: '@waldur-bot:example.org' });
    expect(getAskKind(client, event, ME)).toBeNull();
  });

  it('ignores notify without highlight', () => {
    client.getPushActionsForEvent.mockReturnValue({ notify: true, tweaks: {} });
    expect(getAskKind(client, makeEvent(), ME)).toBeNull();
  });

  it('ignores a highlight that does not notify', () => {
    client.getPushActionsForEvent.mockReturnValue({
      notify: false,
      tweaks: { highlight: true },
    });
    expect(getAskKind(client, makeEvent(), ME)).toBeNull();
  });

  // Push rules suppress edits, so an edit that keeps a mention does not ask
  // again.
  it('ignores an edit that notifies without a highlight', () => {
    client.getPushActionsForEvent.mockReturnValue({ notify: true, tweaks: {} });
    const event = makeEvent({
      content: {
        body: '* hi',
        'm.new_content': { body: 'hi', 'm.mentions': { user_ids: [ME] } },
        'm.relates_to': { rel_type: 'm.replace', event_id: '$original' },
        'm.mentions': { user_ids: [ME] },
      },
    });
    expect(getAskKind(client, event, ME)).toBeNull();
  });

  it.each([
    'org.matrix.msc4075.rtc.notification',
    'm.reaction',
    'm.room.encrypted',
  ])('ignores non-message type %s', (type) => {
    expect(getAskKind(client, makeEvent({ type }), ME)).toBeNull();
  });

  it('ignores redacted events', () => {
    expect(getAskKind(client, makeEvent({ redacted: true }), ME)).toBeNull();
  });

  // Push actions are cached on the event from before decryption, when the
  // rules could only see the encrypted envelope.
  it('recalculates the push actions', () => {
    const event = makeEvent();
    getAskKind(client, event, ME);
    expect(client.getPushActionsForEvent).toHaveBeenCalledWith(event, true);
  });
});

describe('isWelcome', () => {
  it("is the room bot's message with the welcome marker", () => {
    const event = makeEvent({ sender: BOT, content: WELCOME_CONTENT });
    expect(isWelcome(event, BOT, ME)).toBe(true);
  });

  // Any member can put the marker in a message of their own.
  it('ignores the marker from another sender', () => {
    expect(isWelcome(makeEvent({ content: WELCOME_CONTENT }), BOT, ME)).toBe(
      false,
    );
  });

  it('ignores the marker when the room has no known bot', () => {
    const event = makeEvent({
      sender: undefined as any,
      content: WELCOME_CONTENT,
    });
    expect(isWelcome(event, undefined, ME)).toBe(false);
  });

  it('ignores other bot messages', () => {
    expect(isWelcome(makeEvent({ sender: BOT }), BOT, ME)).toBe(false);
  });

  it('ignores a marker that is not true', () => {
    const event = makeEvent({
      sender: BOT,
      content: { ...WELCOME_CONTENT, 'com.waldur.welcome': 'true' },
    });
    expect(isWelcome(event, BOT, ME)).toBe(false);
  });

  it('ignores a redacted welcome', () => {
    const event = makeEvent({
      sender: BOT,
      redacted: true,
      content: WELCOME_CONTENT,
    });
    expect(isWelcome(event, BOT, ME)).toBe(false);
  });

  it('ignores an edit of the welcome', () => {
    const event = makeEvent({
      sender: BOT,
      content: {
        ...WELCOME_CONTENT,
        'm.relates_to': { rel_type: 'm.replace', event_id: '$welcome' },
      },
    });
    expect(isWelcome(event, BOT, ME)).toBe(false);
  });

  it('is the room welcome for every member', () => {
    const event = makeEvent({ sender: BOT, content: WELCOME_CONTENT });
    expect(isWelcome(event, BOT, '@carol:example.org')).toBe(true);
  });

  it.each([
    ['without m.mentions', { 'm.mentions': undefined }],
    ['with no one in m.mentions', { 'm.mentions': { user_ids: [] } }],
  ])('is the room welcome %s', (_case, extra) => {
    const event = makeEvent({
      sender: BOT,
      content: { ...WELCOME_CONTENT, ...extra },
    });
    expect(isWelcome(event, BOT, ME)).toBe(true);
  });

  // The notice of a member's role, posted right after they joined.
  it('is my welcome when the role notice names me', () => {
    const event = makeEvent({
      sender: BOT,
      content: { ...WELCOME_CONTENT, 'm.mentions': { user_ids: [ME] } },
    });
    expect(isWelcome(event, BOT, ME)).toBe(true);
  });

  it('is not my welcome when the role notice names someone else', () => {
    const event = makeEvent({
      sender: BOT,
      content: {
        ...WELCOME_CONTENT,
        'm.mentions': { user_ids: ['@bob:example.org'] },
      },
    });
    expect(isWelcome(event, BOT, ME)).toBe(false);
  });

  it('ignores a role notice naming me from another sender', () => {
    const event = makeEvent({
      content: { ...WELCOME_CONTENT, 'm.mentions': { user_ids: [ME] } },
    });
    expect(isWelcome(event, BOT, ME)).toBe(false);
  });

  it.each(['m.room.encrypted', 'm.reaction'])(
    'ignores non-message type %s',
    (type) => {
      const event = makeEvent({ sender: BOT, type, content: WELCOME_CONTENT });
      expect(isWelcome(event, BOT, ME)).toBe(false);
    },
  );
});
