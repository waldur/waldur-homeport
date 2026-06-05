import { ChatDrawerTab } from './chatDrawerPreferences';

interface ResolveInitialTabArgs {
  /** Tab remembered from the last drawer session. */
  storedTab: ChatDrawerTab;
  /** True when the drawer was opened on a specific Team chat room. */
  hasRoomDeepLink: boolean;
  showAI: boolean;
  showMatrix: boolean;
}

/**
 * Decides which tab the unified chat drawer opens on. A room deep-link always
 * wins; otherwise the last-used tab is restored when its feature is visible,
 * then fall back to whichever feature is enabled.
 */
export function resolveInitialTab({
  storedTab,
  hasRoomDeepLink,
  showAI,
  showMatrix,
}: ResolveInitialTabArgs): ChatDrawerTab {
  if (hasRoomDeepLink && showMatrix) return 'matrix';

  if (storedTab === 'matrix' && showMatrix) return 'matrix';
  if (storedTab === 'ai' && showAI) return 'ai';

  return showAI ? 'ai' : 'matrix';
}
