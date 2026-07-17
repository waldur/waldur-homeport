import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  listInferenceModels,
  splitReasoning,
  streamInferenceReply,
} from './streamChat';

describe('splitReasoning', () => {
  it('returns the plain answer when there is no <think> block', () => {
    expect(splitReasoning('hello')).toEqual({
      answer: 'hello',
      reasoningOpen: false,
    });
  });

  it('splits a closed <think> block into reasoning and answer', () => {
    expect(splitReasoning('<think>because</think>the answer')).toEqual({
      reasoning: 'because',
      answer: 'the answer',
      reasoningOpen: false,
    });
  });

  it('keeps reasoning open while </think> has not streamed yet', () => {
    const result = splitReasoning('<think>still thinking');
    expect(result.reasoningOpen).toBe(true);
    expect(result.answer).toBe('');
    expect(result.reasoning).toBe('still thinking');
  });
});

const sseStream = (chunks: string[]) =>
  new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });

describe('listInferenceModels', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the model ids the endpoint exposes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: [{ id: 'qwen' }, { id: 'gemma' }] }),
      }),
    );
    expect(await listInferenceModels('https://x.test/v1')).toEqual([
      'qwen',
      'gemma',
    ]);
  });

  it('sends the api key as a Bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 'qwen' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await listInferenceModels('https://auth.test/v1', 'sk-xyz');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.test/v1/models',
      expect.objectContaining({ headers: { Authorization: 'Bearer sk-xyz' } }),
    );
  });

  it('throws a friendly error when the endpoint is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    await expect(listInferenceModels('https://b.test/v1')).rejects.toThrow(
      /Could not reach the inference endpoint/,
    );
  });

  it('preserves an AbortError instead of masking it as unreachable', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(
      listInferenceModels('https://b.test/v1'),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('streamInferenceReply', () => {
  afterEach(() => vi.restoreAllMocks());

  it('streams the selected model and yields the accumulated answer', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      body: sseStream([
        'data: {"choices":[{"delta":{"content":"He"}}]}\n',
        'data: {"choices":[{"delta":{"content":"llo"}}]}\n',
        'data: [DONE]\n',
      ]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const chunks: string[] = [];
    for await (const text of streamInferenceReply('https://x.test/v1', 'qwen', [
      { role: 'user', content: 'hi' },
    ])) {
      chunks.push(text);
    }

    expect(chunks).toEqual(['He', 'Hello']);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://x.test/v1/chat/completions');
    expect(JSON.parse((init as any).body).model).toBe('qwen');
  });

  it('sends the api key as a Bearer token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, body: sseStream(['data: [DONE]\n']) });
    vi.stubGlobal('fetch', fetchMock);
    for await (const _ of streamInferenceReply(
      'https://auth.test/v1',
      'qwen',
      [{ role: 'user', content: 'hi' }],
      'sk-xyz',
    )) {
      void _;
    }
    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.test/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer sk-xyz' }),
      }),
    );
  });

  it('raises a friendly error when the endpoint is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );
    await expect(async () => {
      for await (const _ of streamInferenceReply('https://b.test/v1', 'qwen', [
        { role: 'user', content: 'hi' },
      ])) {
        void _;
      }
    }).rejects.toThrow(/Could not reach the inference endpoint/);
  });

  it('preserves an AbortError from a cancelled request', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(async () => {
      for await (const _ of streamInferenceReply('https://b.test/v1', 'qwen', [
        { role: 'user', content: 'hi' },
      ])) {
        void _;
      }
    }).rejects.toMatchObject({ name: 'AbortError' });
  });
});
