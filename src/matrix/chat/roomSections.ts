/**
 * Conversation-list logic for the team chat redesign — search, segment
 * filtering and sectioning. Deliberately free of React and SDK types so it
 * is unit testable and reusable across the drawer, dock and full-page
 * chat layouts.
 */

export type RoomFilter = 'all' | 'unread' | 'mentions';

/**
 * Which kinds of room to list: every kind; the team rooms -- projects', and
 * any other room that is not a step discussion; or the step discussions.
 */
export type RoomKindFilter = 'all' | 'project' | 'step_discussion';

export interface ChatRoomSummary {
  uuid: string;
  name: string;
  scopeName?: string;
  /** The backend's `scope_type`: 'project', 'step_discussion', or none. */
  scopeType?: string | null;
  scopeSubtitle?: string | null;
  unreadCount: number;
  mentionCount: number;
  /** Last activity, ms epoch. 0 when unknown — sorts to the bottom. */
  lastActivity: number;
}

export interface RoomSection {
  key: 'unread' | 'recent' | 'results';
  rooms: ChatRoomSummary[];
}

const byRecentDesc = (a: ChatRoomSummary, b: ChatRoomSummary) =>
  b.lastActivity - a.lastActivity;

const matchesSearch = (room: ChatRoomSummary, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    room.name.toLowerCase().includes(q) ||
    (room.scopeName?.toLowerCase().includes(q) ?? false) ||
    (room.scopeSubtitle?.toLowerCase().includes(q) ?? false)
  );
};

const matchesFilter = (room: ChatRoomSummary, filter: RoomFilter) => {
  if (filter === 'unread') return room.unreadCount > 0;
  if (filter === 'mentions') return room.mentionCount > 0;
  return true;
};

export const matchesKind = (
  room: Pick<ChatRoomSummary, 'scopeType'>,
  kind: RoomKindFilter,
) =>
  kind === 'all' ||
  (kind === 'step_discussion'
    ? room.scopeType === 'step_discussion'
    : room.scopeType !== 'step_discussion');

/**
 * Group rooms for display. With the default `all` filters and no search the
 * list is split into Unread / Recent sections; otherwise it collapses to a
 * single flat `results` section.
 */
export function buildRoomSections(
  rooms: ChatRoomSummary[],
  filter: RoomFilter,
  search: string,
): RoomSection[] {
  const visible = rooms
    .filter((r) => matchesSearch(r, search))
    .filter((r) => matchesFilter(r, filter))
    .sort(byRecentDesc);

  if (filter !== 'all' || search.trim()) {
    return visible.length ? [{ key: 'results', rooms: visible }] : [];
  }

  const unread = visible.filter((r) => r.unreadCount > 0);
  const recent = visible.filter((r) => r.unreadCount === 0);
  const sections: RoomSection[] = [];
  if (unread.length) sections.push({ key: 'unread', rooms: unread });
  if (recent.length) sections.push({ key: 'recent', rooms: recent });
  return sections;
}
