import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getChatDrawerPreference,
  resetChatDrawerPreferences,
  setChatDrawerPreference,
  subscribeChatDrawerPreferences,
} from './chatDrawerPreferences';

beforeEach(() => {
  resetChatDrawerPreferences();
});

describe('chatDrawerPreferences', () => {
  it('returns defaults before anything is set', () => {
    expect(getChatDrawerPreference('activeTab')).toBe('ai');
    expect(getChatDrawerPreference('lastRoomUuid')).toBeNull();
    expect(getChatDrawerPreference('sidebarCollapsed')).toBe(false);
    expect(getChatDrawerPreference('matrixCompactView')).toBe('detail');
  });

  it('round-trips a value through set and get', () => {
    setChatDrawerPreference('activeTab', 'matrix');
    expect(getChatDrawerPreference('activeTab')).toBe('matrix');

    setChatDrawerPreference('lastRoomUuid', 'room-1');
    expect(getChatDrawerPreference('lastRoomUuid')).toBe('room-1');

    setChatDrawerPreference('matrixCompactView', 'list');
    expect(getChatDrawerPreference('matrixCompactView')).toBe('list');
  });

  it('leaves other keys untouched when one key is set', () => {
    setChatDrawerPreference('sidebarCollapsed', true);
    expect(getChatDrawerPreference('activeTab')).toBe('ai');
    expect(getChatDrawerPreference('lastRoomUuid')).toBeNull();
  });

  it('notifies subscribers when a value changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeChatDrawerPreferences(listener);
    setChatDrawerPreference('sidebarCollapsed', true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('does not notify when the value is unchanged', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeChatDrawerPreferences(listener);
    setChatDrawerPreference('sidebarCollapsed', false); // already the default
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('stops notifying after a subscriber unsubscribes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeChatDrawerPreferences(listener);
    unsubscribe();
    setChatDrawerPreference('sidebarCollapsed', true);
    expect(listener).not.toHaveBeenCalled();
  });
});
