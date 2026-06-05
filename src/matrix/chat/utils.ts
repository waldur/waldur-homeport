import type { MatrixEvent, Room } from 'matrix-js-sdk';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { getUserLocale } from '@/i18n/LanguageUtilsService';

import { MatrixChatMessage, ReactionAggregate } from './types';

export function mapEventToMessage(
  event: MatrixEvent,
  room?: Room,
): MatrixChatMessage | null {
  const type = event.getType();
  if (type !== 'm.room.message') return null;

  const content = event.getContent();
  if (!content.body) return null;

  const senderId = event.getSender();
  const member = room?.getMember(senderId);

  const mentionsField = content['m.mentions'];
  const mentionedUserIds = Array.isArray(mentionsField?.user_ids)
    ? (mentionsField.user_ids as unknown[]).filter(
        (v): v is string => typeof v === 'string',
      )
    : undefined;

  return {
    eventId: event.getId(),
    sender: senderId,
    senderDisplayName: member?.name || formatDisplayName(senderId),
    body: content.body,
    timestamp: event.getTs(),
    type: content.msgtype || 'm.text',
    url: content.url,
    info: content.info,
    mentionedUserIds,
  };
}

/**
 * Resolve a Matrix user ID to their canonical Waldur full name.
 * Matrix display names are user-controlled and unreliable (emoji, etc.), so we
 * prefer the full name from the Waldur member list and only fall back — for
 * users with no Waldur account, e.g. native Matrix users — to the sanitized
 * Matrix name, and finally to the humanized localpart.
 */
export function resolveMemberName(
  userId: string,
  memberNames: Map<string, string>,
  matrixName?: string | null,
): string {
  const waldurName = memberNames.get(userId);
  if (waldurName) return waldurName;
  // matrix-js-sdk's `RoomMember.name` returns the raw user ID when no display
  // name is set — treat that as "no name" so we humanize the localpart instead.
  const hasRealName = matrixName && matrixName !== userId;
  const sanitized = hasRealName ? sanitizeName(matrixName) : '';
  return sanitized || formatDisplayName(userId);
}

/** Resolve a message sender to their canonical Waldur full name. */
export function getSenderName(
  message: MatrixChatMessage,
  memberNames: Map<string, string>,
): string {
  return resolveMemberName(
    message.sender,
    memberNames,
    message.senderDisplayName,
  );
}

export function formatDisplayName(userId: string): string {
  const match = userId.match(/^@([^:]+):/);
  if (!match) return userId;
  const localpart = match[1];

  // The appservice bot has no Waldur User row and often no homeserver-stored
  // display name, so without this special case the generic humanization path
  // below would surface "Waldur Bot" verbatim — wrong on whitelabel deployments
  // even when SITE_NAME has been customized.
  if (localpart.endsWith('-bot')) {
    const siteName = ENV.plugins.WALDUR_CORE?.SITE_NAME || 'Waldur';
    return `${siteName} Bot`;
  }

  return localpart
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Strip emoji and pictographic characters from a user-controlled Matrix
 * display name. Without this, `Avatar` derives initials with `charAt(0)`,
 * which splits an emoji's surrogate pair and renders a broken glyph.
 */
export function sanitizeName(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Flatten a Matrix `formatted_body` (HTML) into a single line of plain text for
 * conversation-list previews. `DOMParser` parses into an inert document, so
 * embedded scripts never run — we only read `textContent`, which also decodes
 * entities (`&lt;` → `<`). Block boundaries are joined with spaces and runs of
 * whitespace collapsed, since the preview is a single clamped line.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(getUserLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Compact timestamp for conversation rows: time today, weekday this week, else date. */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const locale = getUserLocale();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const diffDays = (now.getTime() - date.getTime()) / 86_400_000;
  if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function formatDateSeparator(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return translate('Today');
  if (date.toDateString() === yesterday.toDateString())
    return translate('Yesterday');

  return date.toLocaleDateString(getUserLocale(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Group `m.reaction` events by their target message and emoji key.
 * Returns both per-message aggregates and the per-key reactor user_id lists
 * (needed for tooltips). Non-reaction events and redacted reactions are
 * skipped silently.
 */
export function aggregateReactions(
  events: MatrixEvent[],
  myUserId: string,
): {
  aggregates: Map<string, ReactionAggregate[]>;
  reactors: Map<string, Record<string, string[]>>;
} {
  const aggBuckets = new Map<
    string,
    Map<string, { count: number; reactedByMe: boolean; myEventId?: string }>
  >();
  const senderBuckets = new Map<string, Map<string, string[]>>();

  for (const event of events) {
    if (event.getType() !== 'm.reaction') continue;
    if (event.isRedacted?.()) continue;

    const relatesTo = event.getContent()?.['m.relates_to'];
    if (!relatesTo) continue;
    const targetId: string | undefined = relatesTo.event_id;
    const key: string | undefined = relatesTo.key;
    if (!targetId || !key) continue;
    const sender = event.getSender();
    if (!sender) continue;

    // Pending (local-echo) events still count toward UI display so the
    // user sees feedback immediately. But their event IDs are transient
    // (matrix-js-sdk prefixes with `~`) and using them as `myEventId`
    // would make `client.redactEvent` choke — so we only capture the
    // event ID once it's been ack'd by the homeserver.
    const eventId = event.getId();
    const isPending = (event as any).status != null || eventId?.startsWith('~');

    let byKey = aggBuckets.get(targetId);
    if (!byKey) {
      byKey = new Map();
      aggBuckets.set(targetId, byKey);
    }
    let agg = byKey.get(key);
    if (!agg) {
      agg = { count: 0, reactedByMe: false, myEventId: undefined };
      byKey.set(key, agg);
    }
    agg.count += 1;
    if (sender === myUserId) {
      agg.reactedByMe = true;
      if (!isPending) agg.myEventId = eventId;
    }

    let sByKey = senderBuckets.get(targetId);
    if (!sByKey) {
      sByKey = new Map();
      senderBuckets.set(targetId, sByKey);
    }
    const list = sByKey.get(key) ?? [];
    list.push(sender);
    sByKey.set(key, list);
  }

  const aggregates = new Map<string, ReactionAggregate[]>();
  for (const [targetId, byKey] of aggBuckets) {
    const list: ReactionAggregate[] = [];
    for (const [key, { count, reactedByMe, myEventId }] of byKey) {
      list.push({ key, count, reactedByMe, myEventId });
    }
    aggregates.set(targetId, list);
  }

  const reactors = new Map<string, Record<string, string[]>>();
  for (const [targetId, sByKey] of senderBuckets) {
    const obj: Record<string, string[]> = {};
    for (const [key, ids] of sByKey) obj[key] = ids;
    reactors.set(targetId, obj);
  }

  return { aggregates, reactors };
}

/**
 * Like {@link aggregateReactions} but scoped to one message — for live event
 * handlers (timeline insert, local-echo swap, reaction-redaction) that touch
 * exactly one message. Walking the whole timeline per emoji on a long room is
 * O(n) per reaction; scoping the result to a single target lets `setMessages`
 * splice in just that row instead of re-mapping the entire list.
 */
export function aggregateReactionsForTarget(
  events: MatrixEvent[],
  targetId: string,
  myUserId: string,
): { reactions: ReactionAggregate[]; reactors: Record<string, string[]> } {
  const byKey = new Map<
    string,
    { count: number; reactedByMe: boolean; myEventId?: string }
  >();
  const senders: Record<string, string[]> = {};

  for (const event of events) {
    if (event.getType() !== 'm.reaction') continue;
    if (event.isRedacted?.()) continue;

    const relatesTo = event.getContent()?.['m.relates_to'];
    if (!relatesTo || relatesTo.event_id !== targetId) continue;
    const key: string | undefined = relatesTo.key;
    if (!key) continue;
    const sender = event.getSender();
    if (!sender) continue;

    const eventId = event.getId();
    const isPending = (event as any).status != null || eventId?.startsWith('~');

    let agg = byKey.get(key);
    if (!agg) {
      agg = { count: 0, reactedByMe: false, myEventId: undefined };
      byKey.set(key, agg);
    }
    agg.count += 1;
    if (sender === myUserId) {
      agg.reactedByMe = true;
      if (!isPending) agg.myEventId = eventId;
    }

    const list = senders[key] ?? [];
    list.push(sender);
    senders[key] = list;
  }

  const reactions: ReactionAggregate[] = [];
  for (const [key, { count, reactedByMe, myEventId }] of byKey) {
    reactions.push({ key, count, reactedByMe, myEventId });
  }
  return { reactions, reactors: senders };
}
