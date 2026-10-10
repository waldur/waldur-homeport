interface WorkerScope {
  onmessage: ((event: MessageEvent) => unknown) | null;
  onrtctransform?: ((event: any) => unknown) | null;
  postMessage: (message: any, ...rest: any[]) => void;
}

// Messages that set a transform up for a participant's media.
const TRANSFORM_KINDS = new Set(['decode', 'encode', 'updateCodec']);
// Marks the requests made here, so that their replies stay in the worker.
const OWN_REQUEST = 'waldurKeepDecrypting';

// The page's message naming our own identity (see pinOwnIdentity).
const PIN_OWN_IDENTITY = 'waldurOwnIdentity';

/**
 * Tells a worker wrapped by keepDecrypting who we are, before anything else:
 * it sends media under no other identity. Ours is the one our media keys and
 * call token are for; the call server, which names us when we join, could
 * otherwise have our media encrypted with another member's key and shown as
 * theirs.
 */
export function pinOwnIdentity(
  worker: { postMessage: (message: unknown) => void },
  identity: string,
): void {
  worker.postMessage({ kind: PIN_OWN_IDENTITY, identity });
}

const isIdentity = (value: unknown): value is string =>
  typeof value === 'string' && value !== '';

// Stands in for a participant without an identity: decrypting, and never
// given a key, so whatever arrives for it is dropped. A transform the server
// moves to such a participant is moved here rather than left on the
// participant it had, whose media would then show under another name.
const NO_IDENTITY = '\u0000no-identity';

/**
 * Makes LiveKit's E2EE worker in `scope` decrypt every participant's media,
 * whatever it is told. Out of the box it passes a participant's frames
 * through as they come when asked to stop decrypting them, which LiveKit
 * does whenever the call server announces one of their tracks as
 * unencrypted; when a transform loses its participant, which the server can
 * bring about by removing a track and reusing its receiver; and for a
 * participant it was never told about, or one without an identity. The
 * server could then play any media under anyone's name. Here every
 * participant is switched on before a transform is set up for them, never
 * switched off, and a transform without a participant, or one whose track
 * was removed, moves to a participant that has no keys: media that arrives
 * in clear, or under a name it was not sent with, fails to decrypt and is
 * dropped.
 */
export function keepDecrypting(scope: WorkerScope): void {
  const handle = scope.onmessage;
  if (typeof handle !== 'function') {
    throw new Error('The E2EE worker has no message handler to wrap');
  }
  const enabled = new Set<string>();
  // Our own outgoing tracks and whose they are. The worker finds transforms
  // by track id alone, so a request naming one of these for someone else
  // would encrypt our media for them: other members would see it as theirs.
  // Our own identity is the page's to say, not the call server's, which
  // names us when we join: media goes out only under the one the page pinned.
  let ownIdentity: string | undefined;
  const sending = new Set<string>();
  const receiving = new Set<string>();
  // Whether a transform request is to be refused.
  const refused = (kind: unknown, trackId: unknown, identity: unknown) => {
    if (kind === 'encode') {
      if (!ownIdentity || identity !== ownIdentity) return true;
      if (typeof trackId !== 'string' || receiving.has(trackId)) return true;
      sending.add(trackId);
      return false;
    }
    if (typeof trackId !== 'string') return false;
    if (sending.has(trackId)) {
      return !(kind === 'updateCodec' && identity === ownIdentity);
    }
    if (kind === 'decode') receiving.add(trackId);
    return false;
  };
  // What the page asked for in the enables rewritten here, so that the
  // worker's acknowledgement reports that and not the rewrite.
  const requested = new WeakMap<object, boolean>();
  // The worker runs messages in the order they come, so an enable sent
  // first is in force before the transform that follows it.
  const enable = (participantIdentity: string) => {
    if (enabled.has(participantIdentity)) return;
    enabled.add(participantIdentity);
    handle.call(scope, {
      data: {
        kind: 'enable',
        data: { participantIdentity, enabled: true },
        [OWN_REQUEST]: true,
      },
    } as MessageEvent);
  };

  scope.onmessage = function (event: MessageEvent) {
    const message = event.data;
    const data = message?.data;
    if (message?.kind === PIN_OWN_IDENTITY) {
      if (!ownIdentity && isIdentity(message.identity)) {
        ownIdentity = message.identity;
      }
      return;
    }
    if (
      (TRANSFORM_KINDS.has(message?.kind) ||
        message?.kind === 'removeTransform') &&
      refused(message.kind, data?.trackId, data?.participantIdentity)
    ) {
      return;
    }
    // Data we send is ours too.
    if (
      message?.kind === 'encryptDataRequest' &&
      (!ownIdentity || data?.participantIdentity !== ownIdentity)
    ) {
      return;
    }
    if (message?.kind === 'removeTransform') {
      // LiveKit would leave the transform without a participant, passing
      // frames through; kept on its participant instead, a receiver the
      // server reuses for someone else would play their media under that
      // name. Chromium sends nothing that moves a reused audio receiver.
      enable(NO_IDENTITY);
      return handle.call(this, {
        data: {
          kind: 'updateCodec',
          data: {
            participantIdentity: NO_IDENTITY,
            trackId: message.data?.trackId,
          },
        },
      } as MessageEvent);
    }
    if (message?.kind === 'enable' && message.data) {
      requested.set(message, message.data.enabled);
      message.data.enabled = true;
      if (isIdentity(message.data.participantIdentity)) {
        enabled.add(message.data.participantIdentity);
      }
    } else if (TRANSFORM_KINDS.has(message?.kind) && message.data) {
      if (!isIdentity(message.data.participantIdentity)) {
        message.data.participantIdentity = NO_IDENTITY;
      }
      enable(message.data.participantIdentity);
    }
    return handle.call(this, event);
  };

  // Safari and Firefox set transforms up through this event, not a message.
  const transform = scope.onrtctransform;
  if (typeof transform === 'function') {
    scope.onrtctransform = function (event: any) {
      const transformer = event?.transformer;
      if (!transformer?.options) return;
      const { kind, trackId } = transformer.options;
      const participantIdentity = isIdentity(
        transformer.options.participantIdentity,
      )
        ? transformer.options.participantIdentity
        : NO_IDENTITY;
      if (refused(kind, trackId, participantIdentity)) return;
      enable(participantIdentity);
      // A copy of what the worker reads, so that the identity it sees is
      // the one decided here, however the browser hands out the options.
      return transform.call(this, {
        transformer: {
          readable: transformer.readable,
          writable: transformer.writable,
          options: { ...transformer.options, participantIdentity },
        },
      });
    };
  }

  // The worker acknowledges each enable to the page, which looks the
  // participant up and fails for one it has no record of yet.
  const post = scope.postMessage.bind(scope);
  scope.postMessage = (message: any, ...rest: any[]) => {
    if (message?.[OWN_REQUEST]) return;
    if (message && requested.has(message)) {
      const enabled = requested.get(message);
      return post({ ...message, data: { ...message.data, enabled } }, ...rest);
    }
    return post(message, ...rest);
  };
}
