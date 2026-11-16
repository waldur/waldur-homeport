import { useCallback, useSyncExternalStore } from 'react';

import {
  readSessionPreference,
  writeSessionPreference,
} from '@/core/sessionPreference';

/** Which tab the unified chat drawer opens on. AI-only since the drawer split. */
type ChatDrawerTab = 'ai';

interface ChatDrawerPreferences {
  /** Tab to restore on the next drawer open. */
  activeTab: ChatDrawerTab;
  /** Team chat room to reopen, or null for the default. */
  lastRoomUuid: string | null;
  /** Step discussion room to reopen on the Discussions tab, or null. */
  lastDiscussionRoomUuid: string | null;
  /** Shared collapsed state of the AI history and Team chat sidebars. */
  sidebarCollapsed: boolean;
  /**
   * Team chat compact-view section to restore on the next drawer open.
   * Dock view (expanded drawer on md+) shows both list and detail, so this
   * only matters when the drawer is in its narrow default state.
   */
  matrixCompactView: 'list' | 'detail';
}

type PreferenceKey = keyof ChatDrawerPreferences;

const DEFAULTS: ChatDrawerPreferences = {
  activeTab: 'ai',
  lastRoomUuid: null,
  lastDiscussionRoomUuid: null,
  sidebarCollapsed: false,
  matrixCompactView: 'detail',
};

const STORAGE_KEY = 'waldur/chat-drawer-preferences';

// Survives drawer close/reopen and a reload of the tab (session storage), so
// a chat drawer reopened after a reload shows the room it showed.
let preferences: ChatDrawerPreferences = {
  ...DEFAULTS,
  ...readSessionPreference<Partial<ChatDrawerPreferences>>(STORAGE_KEY),
};

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const subscribeChatDrawerPreferences = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getChatDrawerPreference = <K extends PreferenceKey>(
  key: K,
): ChatDrawerPreferences[K] => preferences[key];

export const setChatDrawerPreference = <K extends PreferenceKey>(
  key: K,
  value: ChatDrawerPreferences[K],
): void => {
  if (preferences[key] === value) return;
  preferences = { ...preferences, [key]: value };
  writeSessionPreference(STORAGE_KEY, preferences);
  notify();
};

/** Reset every preference to its default. Primarily used by tests. */
export const resetChatDrawerPreferences = (): void => {
  preferences = { ...DEFAULTS };
  writeSessionPreference(STORAGE_KEY, null);
  notify();
};

/**
 * Reactive accessor for one preference. Components that must re-render when the
 * value changes elsewhere (the shared sidebar flag) use this; one-shot reads
 * use `getChatDrawerPreference` directly.
 */
export const useChatDrawerPreference = <K extends PreferenceKey>(
  key: K,
): [ChatDrawerPreferences[K], (value: ChatDrawerPreferences[K]) => void] => {
  const value = useSyncExternalStore(subscribeChatDrawerPreferences, () =>
    getChatDrawerPreference(key),
  );
  const setValue = useCallback(
    (next: ChatDrawerPreferences[K]) => setChatDrawerPreference(key, next),
    [key],
  );
  return [value, setValue];
};
