import { useOptionalDrawer } from './actions';

/**
 * Read-only view of the drawer's expanded ("full screen") state, false
 * outside a drawer — e.g. to reveal a master/detail sidebar when expanded.
 */
export function useDrawerExpanded(): boolean {
  return useOptionalDrawer()?.expanded ?? false;
}
