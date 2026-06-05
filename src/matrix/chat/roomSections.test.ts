import { describe, it, expect } from 'vitest';

import { buildRoomSections, type ChatRoomSummary } from './roomSections';

const room = (
  over: Partial<ChatRoomSummary> & { name: string },
): ChatRoomSummary => ({
  uuid: over.name,
  unreadCount: 0,
  mentionCount: 0,
  lastActivity: 0,
  ...over,
});

describe('buildRoomSections', () => {
  it('splits the default view into Unread and Recent sections', () => {
    const rooms = [
      room({ name: 'Alpha', unreadCount: 2, lastActivity: 100 }),
      room({ name: 'Beta', lastActivity: 200 }),
    ];
    const sections = buildRoomSections(rooms, 'all', '');
    expect(sections.map((s) => s.key)).toEqual(['unread', 'recent']);
    expect(sections[0].rooms.map((r) => r.name)).toEqual(['Alpha']);
    expect(sections[1].rooms.map((r) => r.name)).toEqual(['Beta']);
  });

  it('sorts rooms within a section by last activity, newest first', () => {
    const rooms = [
      room({ name: 'Old', lastActivity: 100 }),
      room({ name: 'New', lastActivity: 300 }),
      room({ name: 'Mid', lastActivity: 200 }),
    ];
    const [recent] = buildRoomSections(rooms, 'all', '');
    expect(recent.rooms.map((r) => r.name)).toEqual(['New', 'Mid', 'Old']);
  });

  it('omits empty sections', () => {
    const rooms = [room({ name: 'Alpha', unreadCount: 1 })];
    const sections = buildRoomSections(rooms, 'all', '');
    expect(sections.map((s) => s.key)).toEqual(['unread']);
  });

  it('collapses to a single results section when a filter is active', () => {
    const rooms = [
      room({ name: 'Alpha', unreadCount: 1 }),
      room({ name: 'Beta' }),
    ];
    const sections = buildRoomSections(rooms, 'unread', '');
    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe('results');
    expect(sections[0].rooms.map((r) => r.name)).toEqual(['Alpha']);
  });

  it('keeps only mentioned rooms under the mentions filter', () => {
    const rooms = [
      room({ name: 'Alpha', unreadCount: 5, mentionCount: 0 }),
      room({ name: 'Beta', unreadCount: 1, mentionCount: 1 }),
    ];
    const sections = buildRoomSections(rooms, 'mentions', '');
    expect(sections[0].rooms.map((r) => r.name)).toEqual(['Beta']);
  });

  it('matches search against name and scope, case-insensitively', () => {
    const rooms = [
      room({ name: 'LLM Training', scopeName: 'ML Platform' }),
      room({ name: 'Storage', scopeName: 'Infra' }),
    ];
    expect(
      buildRoomSections(rooms, 'all', 'llm')[0].rooms.map((r) => r.name),
    ).toEqual(['LLM Training']);
    expect(
      buildRoomSections(rooms, 'all', 'infra')[0].rooms.map((r) => r.name),
    ).toEqual(['Storage']);
  });

  it('returns an empty array when nothing matches', () => {
    const rooms = [room({ name: 'Alpha' })];
    expect(buildRoomSections(rooms, 'all', 'zzz')).toEqual([]);
  });
});
