import { describe, expect, it, vi } from 'vitest';

import { keepDecrypting, pinOwnIdentity } from './keepDecrypting';

const message = (data: any) => ({ data }) as MessageEvent;

const wrapped = () => {
  const handle = vi.fn();
  const transform = vi.fn();
  const post = vi.fn();
  const scope: any = {
    onmessage: handle,
    onrtctransform: transform,
    postMessage: post,
  };
  keepDecrypting(scope);
  const kinds = () =>
    handle.mock.calls.map(([event]) => [
      event.data.kind,
      event.data.data?.participantIdentity,
      event.data.data?.enabled,
    ]);
  return { scope, handle, transform, post, kinds };
};

describe('keepDecrypting', () => {
  it('turns a request to stop decrypting into one to decrypt', () => {
    const { scope, kinds } = wrapped();

    scope.onmessage(
      message({
        kind: 'enable',
        data: { participantIdentity: '@b:s:B', enabled: false },
      }),
    );

    expect(kinds()).toEqual([['enable', '@b:s:B', true]]);
  });

  it('switches a participant on before their first transform', () => {
    const { scope, kinds } = wrapped();
    const decode = (trackId: string) =>
      message({
        kind: 'decode',
        data: { participantIdentity: '@b:s:B', trackId },
      });

    scope.onmessage(decode('t1'));
    scope.onmessage(decode('t2'));

    expect(kinds()).toEqual([
      ['enable', '@b:s:B', true],
      ['decode', '@b:s:B', undefined],
      ['decode', '@b:s:B', undefined],
    ]);
  });

  it('moves media without a participant to one that has no keys', () => {
    const { scope, kinds, transform } = wrapped();

    // A receiver already bound to a participant, then moved by the server.
    scope.onmessage(
      message({
        kind: 'decode',
        data: { participantIdentity: '@b:s:B', trackId: 't' },
      }),
    );
    for (const participantIdentity of ['', undefined]) {
      scope.onmessage(
        message({
          kind: 'updateCodec',
          data: { participantIdentity, trackId: 't' },
        }),
      );
    }
    const event = {
      transformer: { options: { kind: 'decode', participantIdentity: '' } },
    };
    scope.onrtctransform(event);

    const none = '\u0000no-identity';
    expect(kinds()).toEqual([
      ['enable', '@b:s:B', true],
      ['decode', '@b:s:B', undefined],
      ['enable', none, true],
      ['updateCodec', none, undefined],
      ['updateCodec', none, undefined],
    ]);
    expect(
      transform.mock.calls[0][0].transformer.options.participantIdentity,
    ).toBe(none);
  });

  it('switches participants on only for transforms', () => {
    const { scope, kinds } = wrapped();

    scope.onmessage(
      message({ kind: 'setKey', data: { participantIdentity: '@b:s:B' } }),
    );

    expect(kinds()).toEqual([['setKey', '@b:s:B', undefined]]);
  });

  it('keeps the replies to its own requests in the worker', () => {
    const { scope, handle, post } = wrapped();
    // The worker acknowledges an enable by posting the message back.
    handle.mockImplementation((event: MessageEvent) =>
      scope.postMessage(event.data),
    );

    scope.onmessage(
      message({ kind: 'decode', data: { participantIdentity: '@b:s:B' } }),
    );
    scope.onmessage(
      message({
        kind: 'enable',
        data: { participantIdentity: '@c:s:C', enabled: false },
      }),
    );

    expect(post.mock.calls.map(([m]) => [m.kind, m.data.enabled])).toEqual([
      ['decode', undefined],
      // The page hears back what it asked for; the worker decrypts anyway.
      ['enable', false],
    ]);
    expect(handle.mock.calls.at(-1)[0].data.data.enabled).toBe(true);
  });

  it('moves a removed transform to a participant that has no keys', () => {
    const { scope, kinds, handle } = wrapped();

    scope.onmessage(
      message({
        kind: 'removeTransform',
        data: { participantIdentity: '@b:s:B', trackId: 't1' },
      }),
    );

    expect(kinds()).toEqual([
      ['enable', '\u0000no-identity', true],
      ['updateCodec', '\u0000no-identity', undefined],
    ]);
    expect(handle.mock.calls[1][0].data.data.trackId).toBe('t1');
  });

  it('switches a participant on before a script transform', () => {
    const { scope, kinds, transform } = wrapped();
    const event = {
      transformer: {
        options: { kind: 'decode', participantIdentity: '@c:s:C' },
      },
    };

    scope.onrtctransform(event);

    expect(kinds()).toEqual([['enable', '@c:s:C', true]]);
    expect(transform.mock.calls[0][0].transformer.options).toEqual(
      event.transformer.options,
    );
  });

  describe('our outgoing media', () => {
    const send = (
      scope: any,
      kind: string,
      participantIdentity: string,
      trackId = 'mine',
    ) =>
      scope.onmessage(
        message({ kind, data: { participantIdentity, trackId } }),
      );
    const pinned = () => {
      const w = wrapped();
      pinOwnIdentity(
        { postMessage: (m: any) => w.scope.onmessage(message(m)) },
        '@me:s:ME',
      );
      return w;
    };

    it('goes out only once our identity is pinned, and only under it', () => {
      const unpinned = wrapped();
      send(unpinned.scope, 'encode', '@me:s:ME');
      expect(unpinned.handle).not.toHaveBeenCalled();

      const { scope, kinds } = pinned();
      // The call server named us someone else when we joined.
      send(scope, 'encode', '@b:s:B');
      send(scope, 'encode', '@me:s:ME');
      // A second pin changes nothing.
      pinOwnIdentity(
        { postMessage: (m: any) => scope.onmessage(message(m)) },
        '@b:s:B',
      );
      send(scope, 'encode', '@b:s:B', 'screen');

      expect(kinds()).toEqual([
        ['enable', '@me:s:ME', true],
        ['encode', '@me:s:ME', undefined],
      ]);
    });

    it('can be published again and shared alongside', () => {
      const { scope, kinds } = pinned();

      send(scope, 'encode', '@me:s:ME');
      send(scope, 'updateCodec', '@me:s:ME');
      send(scope, 'encode', '@me:s:ME');
      send(scope, 'encode', '@me:s:ME', 'screen');

      expect(kinds().map(([kind, ,]) => kind)).toEqual([
        'enable',
        'encode',
        'updateCodec',
        'encode',
        'encode',
      ]);
    });

    it('cannot be taken over for someone else', () => {
      const { scope, kinds, transform } = pinned();

      send(scope, 'encode', '@me:s:ME');
      send(scope, 'decode', '@b:s:B');
      send(scope, 'updateCodec', '@b:s:B');
      send(scope, 'removeTransform', '@b:s:B');
      scope.onrtctransform({
        transformer: {
          options: {
            kind: 'decode',
            participantIdentity: '@b:s:B',
            trackId: 'mine',
          },
        },
      });

      expect(kinds()).toEqual([
        ['enable', '@me:s:ME', true],
        ['encode', '@me:s:ME', undefined],
      ]);
      expect(transform).not.toHaveBeenCalled();
    });

    it('is not sent through a track that receives', () => {
      const { scope, kinds } = pinned();

      send(scope, 'decode', '@b:s:B', 'theirs');
      send(scope, 'encode', '@me:s:ME', 'theirs');

      expect(kinds()).toEqual([
        ['enable', '@b:s:B', true],
        ['decode', '@b:s:B', undefined],
      ]);
    });

    it('includes data, encrypted only under our identity', () => {
      const { scope, kinds } = pinned();
      const request = (participantIdentity: string) =>
        scope.onmessage(
          message({
            kind: 'encryptDataRequest',
            data: { participantIdentity },
          }),
        );

      request('@b:s:B');
      request('@me:s:ME');

      expect(kinds()).toEqual([['encryptDataRequest', '@me:s:ME', undefined]]);
    });

    it('goes the same way through script transforms', () => {
      const { scope, transform } = pinned();
      const encode = (participantIdentity: string, trackId: string) => ({
        transformer: {
          options: { kind: 'encode', participantIdentity, trackId },
        },
      });

      scope.onrtctransform(encode('@b:s:B', 'other'));
      scope.onrtctransform(encode('@me:s:ME', 'mine'));

      expect(
        transform.mock.calls.map(([e]) => e.transformer.options.trackId),
      ).toEqual(['mine']);
    });
  });

  it('fails when the worker has no handler to wrap', () => {
    expect(() =>
      keepDecrypting({ onmessage: null, postMessage: vi.fn() }),
    ).toThrow();
  });

  it("wraps LiveKit's own worker, replies included", async () => {
    const scope = globalThis as any;
    const previous = {
      onmessage: scope.onmessage,
      postMessage: scope.postMessage,
    };
    const post = vi.fn();
    scope.postMessage = post;
    await import('livekit-client/e2ee-worker');
    try {
      expect(typeof scope.onmessage).toBe('function');
      expect(scope.onmessage).not.toBe(previous.onmessage);
      keepDecrypting(scope);

      scope.onmessage(
        message({
          kind: 'enable',
          data: { participantIdentity: '@b:s:B', enabled: false },
        }),
      );

      // LiveKit acknowledges through the global postMessage, which the
      // wrapper now stands in for.
      await vi.waitFor(() => expect(post).toHaveBeenCalled());
      expect(post.mock.calls[0][0]).toMatchObject({
        kind: 'enable',
        data: { participantIdentity: '@b:s:B', enabled: false },
      });
    } finally {
      scope.onmessage = previous.onmessage;
      scope.postMessage = previous.postMessage;
    }
  });
});
