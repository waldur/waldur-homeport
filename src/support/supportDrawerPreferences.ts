import { useSyncExternalStore } from 'react';

/** Which tab the support drawer opens on. */
export type SupportDrawerTab = 'chat' | 'helpdesk';

const DEFAULT_TAB: SupportDrawerTab = 'chat';

// Module-scoped: survives drawer close/reopen, resets on page reload.
let activeTab: SupportDrawerTab = DEFAULT_TAB;

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
  notify();
};

/** Reset to the default tab. Primarily used by tests. */
export const resetSupportDrawerPreferences = (): void => {
  activeTab = DEFAULT_TAB;
  notify();
};

/** Reactive accessor so the drawer re-renders when the tab changes. */
export const useSupportTab = (): SupportDrawerTab =>
  useSyncExternalStore(subscribeSupportDrawerPreferences, getSupportTab);
