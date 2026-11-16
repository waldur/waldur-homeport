import { useSyncExternalStore } from 'react';

import {
  readSessionPreference,
  writeSessionPreference,
} from '@/core/sessionPreference';

/** Which tab the support drawer opens on. */
export type SupportDrawerTab = 'chat' | 'discussions' | 'helpdesk';

const DEFAULT_TAB: SupportDrawerTab = 'chat';

const STORAGE_KEY = 'waldur/support-drawer-tab';

// Survives drawer close/reopen and a reload of the tab (session storage).
let activeTab: SupportDrawerTab =
  readSessionPreference<SupportDrawerTab>(STORAGE_KEY) ?? DEFAULT_TAB;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const subscribeSupportDrawerPreferences = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSupportTab = (): SupportDrawerTab => activeTab;

export const setSupportTab = (tab: SupportDrawerTab): void => {
  if (activeTab === tab) return;
  activeTab = tab;
  writeSessionPreference(STORAGE_KEY, tab);
  notify();
};

/** Reset to the default tab. Primarily used by tests. */
export const resetSupportDrawerPreferences = (): void => {
  activeTab = DEFAULT_TAB;
  writeSessionPreference(STORAGE_KEY, null);
  notify();
};

/** Reactive accessor so the drawer re-renders when the tab changes. */
export const useSupportTab = (): SupportDrawerTab =>
  useSyncExternalStore(subscribeSupportDrawerPreferences, getSupportTab);
