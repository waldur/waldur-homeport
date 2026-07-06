import { describe, it, expect, vi } from 'vitest';
import { marketplaceChatStream } from 'waldur-js-client';

import { streamAnonymousChat } from './streamAnonymousChat';

const ndjsonStream = (lines: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      // Emit two frames split across one chunk boundary to exercise buffering.
      controller.enqueue(enc.encode(lines.join('\n') + '\n'));
      controller.close();
    },
  });

describe('streamAnonymousChat', () => {
  it('yields parsed NDJSON frames in order', async () => {
    vi.mocked(marketplaceChatStream).mockResolvedValue({
      data: ndjsonStream([
        JSON.stringify({ m: { interaction_uuid: 'i1', feedback_token: 't1' } }),
        JSON.stringify({ k: 'markdown', c: 'Found 1 offering' }),
        JSON.stringify({ m: { input_tokens: 10, output_tokens: 20 } }),
      ]),
    } as any);

    const parts: any[] = [];
    for await (const p of streamAnonymousChat('GPU', 'sess-12345678'))
      parts.push(p);

    expect(marketplaceChatStream).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { input: 'GPU', session_id: 'sess-12345678' },
        parseAs: 'stream',
      }),
    );
    expect(parts[0].m.interaction_uuid).toBe('i1');
    expect(parts[1].c).toBe('Found 1 offering');
    expect(parts[2].m.output_tokens).toBe(20);
  });

  it('throws when a frame carries an error field', async () => {
    vi.mocked(marketplaceChatStream).mockResolvedValue({
      data: ndjsonStream([JSON.stringify({ e: 'rejected' })]),
    } as any);
    const gen = streamAnonymousChat('x', 'sess-12345678');
    await expect(gen.next()).rejects.toThrow('rejected');
  });

  it('propagates the raw SDK error so the consumer can read response.status', async () => {
    // The SDK throws the parsed body with the response attached. Re-throwing it
    // raw (rather than flattening to a bare Error) is what lets the consumer map
    // the status to a curated message — see parseAnonymousChatStream.
    vi.mocked(marketplaceChatStream).mockRejectedValue({
      detail: 'per_ip_monthly_token',
      response: { status: 409 },
    });
    const gen = streamAnonymousChat('x', 'sess-12345678');
    await expect(gen.next()).rejects.toMatchObject({
      response: { status: 409 },
    });
  });
});
