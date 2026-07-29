import { Client } from '@stomp/stompjs';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  eventConsumersDestroy,
  eventConsumersRegister,
  ObservableObjectTypeEnum,
} from 'waldur-js-client';

import { AuthTokenStorage } from '@/core/StorageManager';
import {
  getCustomer,
  getProject,
  getResource,
  getUser,
} from '@/workspace/selectors';

import { getBrokerUrl } from './config';
import { applyRealtimeEvent, RealtimeEvent } from './invalidations';

interface Scope {
  type: string;
  uuid: string;
}

const OBJECT_TYPES: ObservableObjectTypeEnum[] = [
  'order',
  'resource',
  'user_profile',
  'user_ssh_key',
  'user_role',
];

// Consumers registered by THIS browser session, tracked for teardown on
// logout. The registration response carries no uuid field, but the queue name
// encodes it. Deliberately session-local — listing server-side consumers for
// deletion would, for staff, return other users' consumers too.
const registeredConsumerUuids = new Set<string>();

// Register (or refresh) the event consumer for the given binding set.
// Idempotent per binding set server-side; the 200 fast path also refreshes the
// RabbitMQ password to the caller's current token — which is why this doubles
// as the recovery call after a STOMP auth failure.
const register = async (scopes: Scope[]) => {
  try {
    const response = await eventConsumersRegister({
      body: {
        object_types: OBJECT_TYPES,
        scopes,
      },
    });
    registeredConsumerUuids.add(
      response.data.queue_name.replace(/^consumer_/, ''),
    );
    return response.data;
  } catch {
    return null;
  }
};

// Best-effort deletion of this session's consumers. Called on explicit logout
// (while still authenticated): the backend pre_delete handler removes the
// RabbitMQ queue and user immediately, so the soon-to-be-deleted DRF token
// stops being a valid broker credential. Never throws.
export const teardownRealtimeConsumers = async (): Promise<void> => {
  const uuids = [...registeredConsumerUuids];
  registeredConsumerUuids.clear();
  await Promise.all(
    uuids.map((uuid) =>
      eventConsumersDestroy({ path: { uuid } }).catch(() => undefined),
    ),
  );
};

// Tabs whose binding sets are identical share one queue, so exactly one of
// them may hold the STOMP connection (RabbitMQ round-robins between
// subscribers of a queue — a second subscriber would steal every other
// event). Tabs with different binding sets have different queues and connect
// independently. This key identifies the binding set for the leader lock and
// the follower broadcast channel; it must be deterministic across tabs with
// the same workspace context.
export const bindingSetKey = (candidates: Scope[][]): string =>
  candidates
    .map((set) => set.map((s) => `${s.type}:${s.uuid}`).join('+'))
    .join('|');

const buildCandidates = (
  userUuid: string,
  customerUuid?: string,
  projectUuid?: string,
): Scope[][] => {
  // Every binding set includes the self-referential user scope, so the
  // consumer receives the user's own identity events (profile, SSH keys,
  // roles) and exists on every route. Prefer additionally binding to the
  // customer: one consumer then covers all of its projects and survives
  // navigation within the organization. Binding to a customer requires a
  // customer-level (or ancestor) role, so plain project members fall back
  // to binding their project; with no workspace context at all, the
  // self-only binding still connects.
  const self: Scope = { type: 'user', uuid: userUuid };
  const candidates: Scope[][] = [];
  if (customerUuid) {
    candidates.push([{ type: 'customer', uuid: customerUuid }, self]);
  }
  if (projectUuid) {
    candidates.push([{ type: 'project', uuid: projectUuid }, self]);
  }
  candidates.push([self]);
  // Graceful degradation against a backend without the user-scope feature:
  // fall back to workspace-only bindings rather than losing the connection.
  if (customerUuid) {
    candidates.push([{ type: 'customer', uuid: customerUuid }]);
  }
  if (projectUuid) {
    candidates.push([{ type: 'project', uuid: projectUuid }]);
  }
  return candidates;
};

export const useRealtimeConnection = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const resource = useSelector(getResource);
  const userUuid = user?.uuid;

  // Scope is derived from whatever context the route provides: organization
  // and project workspaces set customer/project; /resource-details/... sets
  // only the current resource, which carries both UUIDs.
  const customerUuid =
    customer?.uuid ?? project?.customer_uuid ?? resource?.customer_uuid;
  const projectUuid = project?.uuid ?? resource?.project_uuid;

  useEffect(() => {
    if (!userUuid) {
      return;
    }
    const abort = new AbortController();
    const candidates = buildCandidates(userUuid, customerUuid, projectUuid);
    const key = bindingSetKey(candidates);
    let client: Client | null = null;

    // Follower path: tabs that did not win the leader lock receive events
    // rebroadcast by the leader. BroadcastChannel never echoes to the sender,
    // so the leader cannot double-apply its own events.
    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(`waldur-realtime:${key}`)
        : null;
    if (channel) {
      channel.onmessage = (event: MessageEvent<RealtimeEvent>) =>
        applyRealtimeEvent(event.data);
    }

    const connect = async () => {
      let registration = null;
      let activeScopes: Scope[] = [];
      for (const scopes of candidates) {
        registration = await register(scopes);
        if (abort.signal.aborted) {
          return;
        }
        if (registration) {
          activeScopes = scopes;
          break;
        }
      }
      if (!registration) {
        // eslint-disable-next-line no-console
        console.warn('Realtime: no binding accepted, staying on polling.');
        return;
      }
      client = new Client({
        brokerURL: getBrokerUrl(),
        connectHeaders: {
          login: registration.rmq_username,
          passcode: AuthTokenStorage.get(),
          host: registration.vhost,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          // Subscriptions don't survive reconnects, so subscribe here.
          // /amq/queue/ attaches to the pre-existing queue without
          // re-declaring it (mismatched arguments would be rejected).
          client.subscribe(
            `/amq/queue/${registration.queue_name}`,
            (message) => {
              try {
                const event: RealtimeEvent = JSON.parse(message.body);
                applyRealtimeEvent(event);
                channel?.postMessage(event);
              } catch {
                // Malformed frame; ignore — events are only invalidation hints.
              }
            },
          );
        },
        onStompError: () => {
          // Most likely a rotated DRF token: the RMQ password is the token,
          // so re-register (refreshes the password server-side) and update
          // the passcode before the client's automatic reconnect.
          register(activeScopes).then(() => {
            if (!abort.signal.aborted && client) {
              client.connectHeaders = {
                ...client.connectHeaders,
                passcode: AuthTokenStorage.get(),
              };
            }
          });
        },
      });
      client.activate();
    };

    if (typeof navigator !== 'undefined' && navigator.locks) {
      // Leader election: the first tab to acquire the per-binding-set lock
      // connects; the others wait on the lock (their request resolves when
      // the leader tab closes or navigates away, releasing the lock) and are
      // fed via the broadcast channel in the meantime.
      navigator.locks
        .request(
          `waldur-realtime:${key}`,
          { signal: abort.signal },
          async () => {
            await connect();
            // Hold the lock until this effect cleans up; releasing it hands
            // leadership to the next waiting tab.
            await new Promise<void>((resolve) => {
              abort.signal.addEventListener('abort', () => resolve());
            });
          },
        )
        .catch(() => undefined); // AbortError when cleanup wins the race
    } else {
      // No Web Locks (insecure context / legacy browser): every tab connects
      // and competes on the queue — the pre-election behavior.
      connect();
    }

    return () => {
      abort.abort();
      channel?.close();
      client?.deactivate();
    };
  }, [userUuid, customerUuid, projectUuid]);
};
