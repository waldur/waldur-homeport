import { BlockedNavigationStorage } from '@/core/StorageManager';
import { cleanObject } from '@/core/utils';
import { router } from '@/router';

/** States the gate lets through, or that are never worth resuming into. */
const NON_RESUMABLE = ['profile', 'errorPage', 'login', 'logout', 'home'];

export const isResumableState = (stateName: string): boolean =>
  Boolean(stateName) &&
  !NON_RESUMABLE.some(
    (name) =>
      stateName === name ||
      stateName.startsWith(name + '.') ||
      stateName.startsWith(name + '-'),
  );

/**
 * Every entry point below is best-effort. They run inside the profile gate and
 * in an onSuccess hook on *every* transition, so a storage failure must degrade
 * to "no page name in the banner", never break navigation.
 */
const attempt = <T>(fn: () => T): T | undefined => {
  try {
    return fn();
  } catch {
    return undefined;
  }
};

export const rememberBlockedNavigation = (
  toState: string,
  toParams?: object,
): void => {
  attempt(() =>
    isResumableState(toState)
      ? BlockedNavigationStorage.set({
          toState,
          toParams: cleanObject(toParams || {}),
        })
      : BlockedNavigationStorage.remove(),
  );
};

export const getBlockedNavigation = () =>
  attempt(() => BlockedNavigationStorage.get()) ?? null;

export const clearBlockedNavigation = (): void => {
  attempt(() => BlockedNavigationStorage.remove());
};

/** Nearest `data.breadcrumb` on the state or its ancestors. */
export const getStateLabel = (stateName: string): string | undefined =>
  attempt(() => {
    let state = router.stateRegistry.get(stateName);
    while (state) {
      if (typeof state.data?.breadcrumb === 'function') {
        return state.data.breadcrumb();
      }
      state = state.parent ? router.stateRegistry.get(state.parent) : null;
    }
    return undefined;
  });
