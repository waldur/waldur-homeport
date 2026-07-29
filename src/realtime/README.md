# Realtime (experimental PoC)

Push-driven cache invalidation over the backend's unified pub/sub. Instead of
polling, the browser registers an event consumer bound to the current project
(`POST /api/event-consumers/register/`), connects to RabbitMQ web-STOMP at
`wss://<api-host>/rmqws-stomp` (the same endpoint site agents use), and turns
incoming `order`/`resource` events into react-query invalidations — the same
`['table', <name>]` invalidation the table refresh button performs.

Events are **invalidation hints only**: the payload is never written into the
cache; affected queries refetch through the normal REST path. Existing polling
is left untouched and acts as the fallback whenever the socket is down.

## Enabling

Gated on the backend feature flag `marketplace.realtime_updates` (**false by
default**). Enable it like any other feature flag (staff UI or
`load_features`); the frontend picks it up from `/api/configuration/` on next
load.

The broker URL is always derived from the API endpoint
(`wss://<api-host>/rmqws-stomp`) and is deliberately **not** configurable from
the client: the STOMP CONNECT carries the user's auth token as passcode, so
client-writable storage must never choose where it is sent. In dev the Vite
proxy serves the same `/rmqws-stomp` path (see `vite.config.ts`; broker target
overridable at server start via `VITE_STOMP_WS_URL`, default
`ws://localhost:15674`).

Backend prerequisite: RabbitMQ with `rabbitmq_web_stomp` (mastermind emits
order/resource state-transition events unconditionally).

## Scope strategy

Every binding set includes the **self-referential user scope**
(`{type: 'user', uuid: <own>}`), which delivers the user's own identity events
(`user_profile`, `user_ssh_key`, `user_role`) and guarantees a live consumer on
every route — including profile and admin pages with no workspace context.
Additionally the consumer is bound to the **customer** when one can be derived
from the workspace (organization/project workspaces, or the current resource on
`/resource-details/...`) — one consumer then covers all of that customer's
projects and survives navigation. Binding to a customer requires a
customer-level role, so plain project members automatically fall back to a
**project** binding, and with no workspace context at all the self-only
binding still connects.

## Multi-tab

Tabs whose binding sets are identical share one queue, so exactly one of them
holds the STOMP connection: tabs contend on a Web Locks API lock keyed by the
binding set; the winner connects and rebroadcasts every event over a
`BroadcastChannel` (same key) to the others, which apply the same
invalidations. When the leader tab closes, the lock passes to a waiting tab,
which re-registers (idempotent) and connects. Tabs in _different_ workspaces
derive different binding sets — different queues — and correctly keep
independent connections. Without the Web Locks API (insecure context/legacy
browser) every tab connects and competes on the queue, the pre-election
behavior.

## Logout

Explicit logout deletes the consumers this session registered (bounded,
best-effort, before the auth token is invalidated) — the backend removes their
RabbitMQ queues and users immediately, so the deleted token stops being a
valid broker credential. Sessions that end via an expired token (the 401 path)
cannot clean up and rely on the daily stale sweep, as before.

## Known PoC limitations

- **STOMP credential = DRF token**: token rotation invalidates the RMQ
  password; `onStompError` re-registers (which refreshes the password) and
  reconnects.
- Coverage: orders, resources, and own identity events — no
  invoice/support/proposal events yet.
