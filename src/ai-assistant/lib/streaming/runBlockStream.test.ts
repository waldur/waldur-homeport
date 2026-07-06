import type { ThreadMessageLike } from '@assistant-ui/react';
import { describe, expect, it, vi } from 'vitest';

import { runBlockStream } from './runBlockStream';

const seed = (): ThreadMessageLike => ({
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

const streamOf = (parts: any[]): AsyncIterable<any> => ({
  async *[Symbol.asyncIterator]() {
    for (const p of parts) yield p;
  },
});

const rejectingStream = (error: any): AsyncIterable<any> => ({
  [Symbol.asyncIterator]: () => ({ next: () => Promise.reject(error) }),
});

describe('runBlockStream', () => {
  it('accumulates blocks and completes the message', async () => {
    const messages = { current: [seed()] as readonly ThreadMessageLike[] };
    const onComplete = vi.fn();
    await runBlockStream({
      stream: streamOf([{ k: 'markdown', c: 'hello' }]),
      assistantId: 'a1',
      signal: new AbortController().signal,
      setMessages: trackedSetMessages(messages),
      mapError: (e) => String(e),
      onComplete,
    });
    const m = messages.current[0];
    expect(m.status).toEqual({ type: 'complete', reason: 'stop' });
    expect((m.metadata?.custom as any).blocks.length).toBeGreaterThan(0);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('runs captureMeta on every frame', async () => {
    const messages = { current: [seed()] as readonly ThreadMessageLike[] };
    const captureMeta = vi.fn();
    await runBlockStream({
      stream: streamOf([
        { m: { thread_uuid: 't' } },
        { k: 'markdown', c: 'x' },
      ]),
      assistantId: 'a1',
      signal: new AbortController().signal,
      setMessages: trackedSetMessages(messages),
      captureMeta,
      mapError: (e) => String(e),
    });
    expect(captureMeta).toHaveBeenCalledTimes(2);
  });

  it('maps an error to incomplete status and fires onError, not onComplete', async () => {
    const messages = { current: [seed()] as readonly ThreadMessageLike[] };
    const onError = vi.fn();
    const onComplete = vi.fn();
    await runBlockStream({
      stream: rejectingStream(new Error('boom')),
      assistantId: 'a1',
      signal: new AbortController().signal,
      setMessages: trackedSetMessages(messages),
      mapError: () => 'mapped message',
      onError,
      onComplete,
    });
    expect(messages.current[0].status).toEqual({
      type: 'incomplete',
      reason: 'error',
      error: 'mapped message',
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('marks a Stop caught by the loop-top abort guard as cancelled, not complete', async () => {
    const messages = { current: [seed()] as readonly ThreadMessageLike[] };
    const controller = new AbortController();
    const onComplete = vi.fn();
    // Abort between frames (no thrown AbortError): the loop-top `signal.aborted`
    // guard breaks before the second frame is processed.
    const stream: AsyncIterable<any> = {
      async *[Symbol.asyncIterator]() {
        yield { k: 'markdown', c: 'partial' };
        controller.abort();
        yield { k: 'markdown', c: 'more' };
      },
    };
    await runBlockStream({
      stream,
      assistantId: 'a1',
      signal: controller.signal,
      setMessages: trackedSetMessages(messages),
      mapError: (e) => String(e),
      onComplete,
    });
    const status = messages.current[0].status as any;
    expect(status.type).toBe('incomplete');
    expect(status.reason).toBe('cancelled');
    expect(status.error).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('persists extraCustom on a metadata-only frame', async () => {
    const messages = { current: [seed()] as readonly ThreadMessageLike[] };
    await runBlockStream({
      stream: streamOf([{ m: { interaction_uuid: 'i1' } }]),
      assistantId: 'a1',
      signal: new AbortController().signal,
      setMessages: trackedSetMessages(messages),
      extraCustom: () => ({ interactionUuid: 'i1', feedbackToken: 't1' }),
      mapError: (e) => String(e),
    });
    const custom = messages.current[0].metadata?.custom as any;
    expect(custom.interactionUuid).toBe('i1');
    expect(custom.feedbackToken).toBe('t1');
  });
});
