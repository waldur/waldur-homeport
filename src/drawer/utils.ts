import { drawerState } from './DrawerContext';

/**
 * Whether the drawer is open, for code outside React (stream callbacks,
 * effects). React components read `isOpen` from useDrawer() instead.
 */
export const isDrawerOpen = (): boolean => drawerState.isOpen;

/**
 * True when the drawer is open AND showing the drawer with this shell class
 * (e.g. `ai-chat-drawer-active`). Lets a toggle button decide between
 * closing its own drawer and switching to it from another one.
 */
export const isDrawerOpenWithClass = (className: string): boolean =>
  drawerState.isOpen && drawerState.shellClass === className;
