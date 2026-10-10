import { ClientEvent, MatrixClient, MatrixEvent } from 'matrix-js-sdk';

/** The to-device event that carries a call member's media key. */
export const CALL_KEYS_EVENT = 'io.element.call.encryption_keys';

// matrix-js-sdk's CryptoEvent.DevicesUpdated, re-emitted by the client.
const DEVICES_UPDATED = 'crypto.devicesUpdated';

/** How long a key from a device we don't know yet waits for its device. */
const PENDING_KEY_TTL_MS = 60_000;
/** How many such keys wait per sender; older ones are dropped first. */
const MAX_PENDING_KEYS_PER_SENDER = 8;
/** How many senders may have keys waiting; anyone can send us one. */
const MAX_PENDING_SENDERS = 32;
/**
 * How many of them may be outside the room: someone whose key arrives just
 * before their join does is, for a moment.
 */
const MAX_PENDING_NON_MEMBERS = 4;

interface ReceivedToDeviceMessage {
  message: { type: string; sender: string; content: any };
  encryptionInfo: {
    sender: string;
    senderDevice?: string;
    senderCurve25519KeyBase64: string;
  } | null;
}

type Verdict = 'authentic' | 'forged' | 'unknown-device';

// The device that sent an Olm message. Rust crypto names it only when it
// already knows the device; otherwise it is the device whose Curve25519 key
// the message was sent with, among those already known. A call member shares
// an encrypted room with us, so their devices are tracked: none is fetched
// here, which would let anyone make us query the homeserver.
async function senderDevice(
  client: MatrixClient,
  info: NonNullable<ReceivedToDeviceMessage['encryptionInfo']>,
): Promise<string | undefined> {
  if (info.senderDevice) return info.senderDevice;
  const devices = await client
    .getCrypto()
    ?.getUserDeviceInfo([info.sender], false)
    .catch(() => undefined);
  for (const device of devices?.get(info.sender)?.values() ?? []) {
    if (device.getIdentityKey() === info.senderCurve25519KeyBase64) {
      return device.deviceId;
    }
  }
  return undefined;
}

/**
 * Whether a received to-device message is a key for this room's call that
 * its claimed sender really sent: Olm-encrypted, by the user it names, from
 * the device it names. matrix-js-sdk's key transport takes the user and
 * device as claimed, and also accepts keys sent in clear, so any room member
 * could otherwise slip a key in under another member's device.
 */
export async function checkCallKey(
  client: MatrixClient,
  roomId: string,
  { message, encryptionInfo }: ReceivedToDeviceMessage,
): Promise<Verdict> {
  if (message.type !== CALL_KEYS_EVENT || !encryptionInfo) return 'forged';
  if (encryptionInfo.sender !== message.sender) return 'forged';
  if (message.content?.room_id !== roomId) return 'forged';
  const claimed = message.content?.member?.claimed_device_id;
  if (typeof claimed !== 'string' || !claimed) return 'forged';
  const device = await senderDevice(client, encryptionInfo);
  if (device === undefined) return 'unknown-device';
  return device === claimed ? 'authentic' : 'forged';
}

type ToDeviceListener = (event: MatrixEvent) => void;

/**
 * The client a call session sends and receives media keys through: the real
 * client, except that the key transport hears only authentic keys for the
 * call in `roomId`, in the order they arrived. It listens for
 * `ClientEvent.ToDeviceEvent`, which drops the Olm sender; this feeds it from
 * `ClientEvent.ReceivedToDeviceMessage`, which keeps it. A key from a device
 * not known yet, such as a member who just joined, waits for the device list
 * to catch up instead of being lost until the next rotation.
 */
export function keyGatedClient(
  client: MatrixClient,
  roomId: string,
): MatrixClient {
  const listeners = new Set<ToDeviceListener>();
  const pending = new Map<
    string,
    { received: ReceivedToDeviceMessage; at: number }[]
  >();
  // Keys are checked one at a time, so they reach the transport in arrival
  // order: it stamps each with the time it hears it, and keeps the newest.
  let queue: Promise<unknown> = Promise.resolve();

  const deliver = (received: ReceivedToDeviceMessage) => {
    const event = new MatrixEvent({
      type: received.message.type,
      sender: received.message.sender,
      content: received.message.content,
    });
    listeners.forEach((listener) => listener(event));
  };

  // A call member whose device is not known yet is a member of the room;
  // anyone else gets few places among those waiting.
  const isRoomMember = (userId: string) =>
    client.getRoom(roomId)?.getMember(userId)?.membership === 'join';

  const hold = (received: ReceivedToDeviceMessage, at: number) => {
    const now = Date.now();
    if (now - at > PENDING_KEY_TTL_MS) return;
    for (const [sender, waiting] of pending) {
      const fresh = waiting.filter((w) => now - w.at <= PENDING_KEY_TTL_MS);
      if (fresh.length) pending.set(sender, fresh);
      else pending.delete(sender);
    }
    const sender = received.message.sender;
    if (!pending.has(sender)) {
      if (!isRoomMember(sender)) {
        // The oldest outsider makes way, so that a crowd of them cannot keep
        // out someone whose join has not arrived yet.
        const outsiders = [...pending.keys()].filter((s) => !isRoomMember(s));
        if (outsiders.length >= MAX_PENDING_NON_MEMBERS) {
          pending.delete(outsiders[0]);
        }
      }
      if (pending.size >= MAX_PENDING_SENDERS) return;
    }
    const waiting = pending.get(sender) ?? [];
    waiting.push({ received, at });
    pending.set(sender, waiting.slice(-MAX_PENDING_KEYS_PER_SENDER));
  };

  const check = async (received: ReceivedToDeviceMessage, at: number) => {
    const verdict = await checkCallKey(client, roomId, received);
    if (verdict === 'authentic') deliver(received);
    else if (verdict === 'unknown-device') hold(received, at);
  };

  const onMessage = (received: ReceivedToDeviceMessage) => {
    if (received.message.type !== CALL_KEYS_EVENT) return;
    const at = Date.now();
    queue = queue.then(() => check(received, at)).catch(() => undefined);
  };

  const onDevicesUpdated = (userIds: string[]) => {
    const now = Date.now();
    for (const userId of userIds) {
      const waiting = pending.get(userId);
      if (!waiting) continue;
      pending.delete(userId);
      for (const { received, at } of waiting) {
        if (now - at > PENDING_KEY_TTL_MS) continue;
        queue = queue.then(() => check(received, at)).catch(() => undefined);
      }
    }
  };

  const start = () => {
    client.on(ClientEvent.ReceivedToDeviceMessage, onMessage as any);
    client.on(DEVICES_UPDATED as any, onDevicesUpdated as any);
  };
  const stop = () => {
    client.off(ClientEvent.ReceivedToDeviceMessage, onMessage as any);
    client.off(DEVICES_UPDATED as any, onDevicesUpdated as any);
    pending.clear();
  };

  const proxy: MatrixClient = new Proxy(client, {
    get(target, prop) {
      if (prop === 'on' || prop === 'off') {
        return (event: string, listener: any) => {
          if (event !== ClientEvent.ToDeviceEvent) {
            (target as any)[prop](event, listener);
          } else if (prop === 'on') {
            if (listeners.size === 0) start();
            listeners.add(listener);
          } else if (listeners.delete(listener) && listeners.size === 0) {
            stop();
          }
          return proxy;
        };
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  return proxy;
}
