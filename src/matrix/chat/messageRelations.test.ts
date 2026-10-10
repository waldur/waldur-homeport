import { describe, expect, it } from 'vitest';

import {
  getReplacedEventId,
  getReplyToEventId,
  indexEdits,
  isValidEdit,
  selectLatestEdit,
  stripReplyFallback,
} from './messageRelations';

interface FakeEventOptions {
  id: string;
  sender?: string;
  ts?: number;
  type?: string;
  content?: Record<string, any>;
  redacted?: boolean;
  decryptionFailure?: boolean;
  status?: string | null;
  encrypted?: boolean;
}

const fakeEvent = ({
  id,
  sender = '@alice:s',
  ts = 1,
  type = 'm.room.message',
  content = { msgtype: 'm.text', body: 'hello' },
  redacted = false,
  decryptionFailure = false,
  status = null,
  encrypted = false,
}: FakeEventOptions) =>
  ({
    getId: () => id,
    getSender: () => sender,
    getTs: () => ts,
    getType: () => type,
    getContent: () => content,
    getWireContent: () => content,
    isRedacted: () => redacted,
    isEncrypted: () => encrypted,
    isDecryptionFailure: () => decryptionFailure,
    isState: () => false,
    status,
  }) as any;

const editOf = (
  targetId: string,
  body: string,
  options: Partial<FakeEventOptions> = {},
) =>
  fakeEvent({
    id: `$edit-${body}`,
    ts: 2,
    ...options,
    content: {
      msgtype: 'm.text',
      body: `* ${body}`,
      'm.new_content': { msgtype: 'm.text', body },
      'm.relates_to': { rel_type: 'm.replace', event_id: targetId },
      ...options.content,
    },
  });

const original = fakeEvent({ id: '$orig' });

describe('relations of an event', () => {
  it('reads the event an edit replaces', () => {
    expect(getReplacedEventId(editOf('$orig', 'x'))).toBe('$orig');
    expect(getReplacedEventId(original)).toBeUndefined();
  });

  it('reads the event a reply answers', () => {
    const reply = fakeEvent({
      id: '$reply',
      content: {
        msgtype: 'm.text',
        body: 'yes',
        'm.relates_to': { 'm.in_reply_to': { event_id: '$orig' } },
      },
    });
    expect(getReplyToEventId(reply)).toBe('$orig');
    expect(getReplyToEventId(original)).toBeUndefined();
  });

  it('ignores the fallback reply of a threaded message', () => {
    const threaded = fakeEvent({
      id: '$t',
      content: {
        msgtype: 'm.text',
        body: 'in thread',
        'm.relates_to': {
          rel_type: 'm.thread',
          event_id: '$root',
          is_falling_back: true,
          'm.in_reply_to': { event_id: '$last' },
        },
      },
    });
    expect(getReplyToEventId(threaded)).toBeUndefined();
  });
});

describe('selectLatestEdit', () => {
  it('lets the newest edit win', () => {
    const first = editOf('$orig', 'first', { ts: 2 });
    const second = editOf('$orig', 'second', { ts: 3 });
    expect(selectLatestEdit(original, [second, first])).toBe(second);
  });

  it('breaks a timestamp tie by the greater event id', () => {
    const a = editOf('$orig', 'a', { ts: 5 });
    const b = editOf('$orig', 'b', { ts: 5 });
    expect(selectLatestEdit(original, [b, a])).toBe(b);
    expect(selectLatestEdit(original, [a, b])).toBe(b);
  });

  it("ignores an edit from anyone but the message's sender", () => {
    const forged = editOf('$orig', 'forged', { sender: '@mallory:s', ts: 9 });
    const own = editOf('$orig', 'own', { ts: 2 });
    expect(isValidEdit(original, forged)).toBe(false);
    expect(selectLatestEdit(original, [own, forged])).toBe(own);
  });

  it('does not let an edit be edited', () => {
    const edit = editOf('$orig', 'first');
    const editOfEdit = editOf('$edit-first', 'second', { ts: 3 });
    expect(selectLatestEdit(edit, [editOfEdit])).toBeNull();
  });

  it('ignores an edit of another message', () => {
    expect(selectLatestEdit(original, [editOf('$other', 'x')])).toBeNull();
  });

  it('ignores deleted, failed and undecrypted edits', () => {
    expect(
      selectLatestEdit(original, [
        editOf('$orig', 'deleted', { redacted: true }),
        editOf('$orig', 'failed', { decryptionFailure: true }),
        editOf('$orig', 'unsent', { status: 'not_sent' }),
        editOf('$orig', 'cancelled', { status: 'cancelled' }),
        // Still encrypted: its type is not the original's yet.
        editOf('$orig', 'encrypted', { type: 'm.room.encrypted' }),
      ]),
    ).toBeNull();
  });

  it('ignores an edit in clear of an encrypted message', () => {
    const encryptedOriginal = fakeEvent({ id: '$orig', encrypted: true });
    const clear = editOf('$orig', 'clear');
    const encrypted = editOf('$orig', 'encrypted', { encrypted: true });
    expect(isValidEdit(encryptedOriginal, clear)).toBe(false);
    expect(isValidEdit(encryptedOriginal, encrypted)).toBe(true);
    // The user's own edit is encrypted only as it is sent.
    const sending = editOf('$orig', 'sending', { status: 'encrypting' });
    expect(isValidEdit(encryptedOriginal, sending)).toBe(true);
  });

  it('accepts an edit still being sent', () => {
    const sending = editOf('$orig', 'sending', { status: 'sending' });
    expect(selectLatestEdit(original, [sending])).toBe(sending);
  });

  it('ignores an edit without usable new content', () => {
    const missing = editOf('$orig', 'x', {
      content: { 'm.new_content': undefined },
    });
    const noBody = editOf('$orig', 'y', {
      content: { 'm.new_content': { msgtype: 'm.text' } },
    });
    expect(selectLatestEdit(original, [missing, noBody])).toBeNull();
  });

  it('keeps a deleted message deleted', () => {
    const deleted = fakeEvent({ id: '$orig', redacted: true, content: {} });
    expect(selectLatestEdit(deleted, [editOf('$orig', 'x')])).toBeNull();
  });
});

describe('indexEdits', () => {
  it('groups edits by the message they edit', () => {
    const a = editOf('$one', 'a');
    const b = editOf('$one', 'b');
    const c = editOf('$two', 'c');
    const index = indexEdits([original, a, b, c]);
    expect(index.get('$one')).toEqual([a, b]);
    expect(index.get('$two')).toEqual([c]);
    expect(index.has('$orig')).toBe(false);
  });
});

describe('stripReplyFallback', () => {
  it('removes the quoted parent older clients put in a reply', () => {
    expect(
      stripReplyFallback('> <@alice:s> question\n> more\n\nthe answer'),
    ).toBe('the answer');
  });

  it('removes the quoted parent of an emote', () => {
    expect(stripReplyFallback('> * <@alice:s> waves\n\nhello')).toBe('hello');
  });

  it("keeps a reply's own quote", () => {
    expect(stripReplyFallback('> a quote\n\nmy reply')).toBe(
      '> a quote\n\nmy reply',
    );
  });
});
