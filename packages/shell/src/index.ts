export { AppShell } from './AppShell';
export type { AppShellProps } from './AppShell';

export { bootstrapMicroApp, whenMicroAppBootstrapped } from './bootstrap';
export type { MicroAppBootstrapConfig } from './bootstrap';

export { createSharedStorage } from './sharedStorage';

export { useShellTheme } from './useShellTheme';
export { activeRoleNames, useCurrentUser } from './useCurrentUser';
export { useShellLanguage } from './useShellLanguage';

export { UserMenu } from './UserMenu';
export type { CurrentUser } from './UserMenu';

export { useManagedMutation } from './useManagedMutation';
export type { ManagedMutationProps } from './useManagedMutation';
export { useBatchMutation } from './useBatchMutation';

export {
  MICRO_APPS_FEATURE,
  fetchMicroApps,
  isMicroAppVisible,
  portalBase,
  resetMicroAppsRegistry,
  useExternalLinks,
  useMicroApps,
} from './microApps';
export type { FeatureFlags, MicroAppEntry, ShortcutsViewer } from './microApps';
export { QuickShortcutsMenu, useAppShortcuts } from './QuickShortcutsMenu';
export type {
  AppShortcut,
  QuickShortcutsMenuProps,
} from './QuickShortcutsMenu';
