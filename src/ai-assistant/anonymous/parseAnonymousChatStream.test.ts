import type { ThreadMessageLike } from '@assistant-ui/react';
import { it, expect, vi, beforeEach } from 'vitest';

import { parseAnonymousChatStream } from './parseAnonymousChatStream';
import { getAnonymousSessionId } from './session';
import { streamAnonymousChat } from './streamAnonymousChat';

vi.mock('./streamAnonymousChat', () => ({ streamAnonymousChat: vi.fn() }));

const seedMessage = (): ThreadMessageLike => ({
  id: 'a1',
  role: 'assistant',
  content: [{ type: 'text', text: '' }],
  metadata: {},
});

const trackedSetMessages =
  (ref: { current: readonly ThreadMessageLike[] }) => (updater: any) => {
    ref.current =
      typeof updater === 'function' ? updater(ref.current) : updater;
  };

beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(streamAnonymousChat).mockImplementation(async function* () {
    yield { m: { interaction_uuid: 'i1', feedback_token: 't1' } };
    yield { k: 'markdown', c: 'Found offerings' };
    yield { m: { input_tokens: 5, output_tokens: 7 } };
  });
});

it('captures interaction metadata and writes blocks to the assistant message', async () => {
  const messages = { current: [seedMessage()] as readonly ThreadMessageLike[] };

  await parseAnonymousChatStream({
    input: 'GPU',
    sessionId: 'sess-12345678',
    assistantId: 'a1',
    signal: new AbortController().signal,
    setMessages: trackedSetMessages(messages),
  });

  const custom = (messages.current[0].metadata?.custom ?? {}) as any;
  expect(custom.interactionUuid).toBe('i1');
  expect(custom.feedbackToken).toBe('t1');
  expect(custom.blocks.length).toBeGreaterThan(0);
});

it('maps a rejected stream to the curated per-status message', async () => {
  // Async-iterable that rejects on first pull — models the SDK throwing the
  // parsed 409 body with response.status attached, which streamAnonymousChat
  // now propagates raw so mapAnonymousChatError can pick the curated message.
  vi.mocked(streamAnonymousChat).mockReturnValue({
    [Symbol.asyncIterator]: () => ({
      next: () =>
        Promise.reject({
          detail: 'per_ip_monthly_token',
          response: { status: 409 },
        }),
    }),
  } as any);
  const sessionBefore = getAnonymousSessionId();
  const messages = { current: [seedMessage()] as readonly ThreadMessageLike[] };

  await parseAnonymousChatStream({
    input: 'GPU',
    sessionId: 'sess-12345678',
    assistantId: 'a1',
    signal: new AbortController().signal,
    setMessages: trackedSetMessages(messages),
  });

  expect(messages.current[0].status).toEqual({
    type: 'incomplete',
    reason: 'error',
    error:
      'The assistant is unavailable or your usage limit was reached. Please try again later.',
  });
  // A 409 is not session-scoped, so the id must be left intact.
  expect(getAnonymousSessionId()).toBe(sessionBefore);
});

it('resets the session on a session-expired 403 so the next send starts fresh', async () => {
  vi.mocked(streamAnonymousChat).mockReturnValue({
    [Symbol.asyncIterator]: () => ({
      // 403 with no human-readable detail = bound session no longer valid.
      next: () => Promise.reject({ response: { status: 403 } }),
    }),
  } as any);
  const sessionBefore = getAnonymousSessionId();
  const messages = { current: [seedMessage()] as readonly ThreadMessageLike[] };

  await parseAnonymousChatStream({
    input: 'GPU',
    sessionId: 'sess-12345678',
    assistantId: 'a1',
    signal: new AbortController().signal,
    setMessages: trackedSetMessages(messages),
  });

  expect(getAnonymousSessionId()).not.toBe(sessionBefore);
});
