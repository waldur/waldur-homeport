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

// A LiteLLM gateway says what each model is for in /model/info
// (model_info.mode). The playground only chats, so models marked for
// something else are left out of its picker.
describe('listInferenceModels on a gateway that reports model modes', () => {
  afterEach(() => vi.restoreAllMocks());

  const ok = (body: unknown) => ({
    ok: true,
    json: () => Promise.resolve(body),
  });

  // Answers /models with the given ids and /model/info with the given modes.
  const gateway = (ids: string[], modeInfo: unknown) =>
    vi.fn((url: string) =>
      Promise.resolve(
        url.endsWith('/model/info')
          ? modeInfo
          : ok({ data: ids.map((id) => ({ id })) }),
      ),
    );

  const modes = (entries: Record<string, string | null>) =>
    ok({
      data: Object.entries(entries).map(([model_name, mode]) => ({
        model_name,
        model_info: { mode },
      })),
    });

  it('leaves out models the gateway marks as not for chat', async () => {
    // Assign: a gateway with one chat model and three others
    vi.stubGlobal(
      'fetch',
      gateway(
        [
          'Qwen3.8-27B',
          'qwen3-embedding-4b',
          'qwen3-reranker-4b',
          'clef-flash',
        ],
        modes({
          'Qwen3.8-27B': 'chat',
          'qwen3-embedding-4b': 'embedding',
          'qwen3-reranker-4b': 'rerank',
          'clef-flash': 'evaluation',
        }),
      ),
    );

    // Act: list the models
    const models = await listInferenceModels('https://gw.test/v1');

    // Assert: only the chat model is offered
    expect(models).toEqual(['Qwen3.8-27B']);
  });

  it('keeps a model whose mode is not set', async () => {
    // Assign: one chat model and one without a mode
    vi.stubGlobal(
      'fetch',
      gateway(['chatty', 'unknown'], modes({ chatty: 'chat', unknown: null })),
    );

    // Act: list the models
    const models = await listInferenceModels('https://gw.test/v1');

    // Assert: both are offered
    expect(models).toEqual(['chatty', 'unknown']);
  });

  it('keeps every model when the gateway has no /model/info', async () => {
    // Assign: a gateway without /model/info
    vi.stubGlobal(
      'fetch',
      gateway(['qwen', 'gemma'], { ok: false, status: 404 }),
    );

    // Act: list the models
    const models = await listInferenceModels('https://plain.test/v1');

    // Assert: every model is offered
    expect(models).toEqual(['qwen', 'gemma']);
  });

  it('asks /model/info with the same api key', async () => {
    // Assign: a gateway that reports modes
    const fetchMock = gateway(['qwen'], modes({ qwen: 'chat' }));
    vi.stubGlobal('fetch', fetchMock);

    // Act: list the models with a key
    await listInferenceModels('https://gw.test/v1', 'sk-xyz');

    // Assert: /model/info got the same Bearer key
    expect(fetchMock).toHaveBeenCalledWith(
      'https://gw.test/v1/model/info',
      expect.objectContaining({ headers: { Authorization: 'Bearer sk-xyz' } }),
    );
  });

  it('says so when no chat model is left', async () => {
    // Assign: a gateway with only an embedding model
    vi.stubGlobal(
      'fetch',
      gateway(
        ['qwen3-embedding-4b'],
        modes({ 'qwen3-embedding-4b': 'embedding' }),
      ),
    );

    // Act: list the models
    const listing = listInferenceModels('https://gw.test/v1');

    // Assert: it says there is no chat model
    await expect(listing).rejects.toThrow(
      /The endpoint does not expose any chat model/,
    );
  });

  it('preserves an AbortError from /model/info', async () => {
    // Assign: /model/info is cancelled
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.endsWith('/model/info')
          ? Promise.reject(abort)
          : Promise.resolve(ok({ data: [{ id: 'qwen' }] })),
      ),
    );

    // Act: list the models
    const listing = listInferenceModels('https://gw.test/v1');

    // Assert: the AbortError comes through
    await expect(listing).rejects.toMatchObject({ name: 'AbortError' });
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
