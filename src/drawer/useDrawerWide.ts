import { useOptionalDrawer } from './actions';

/**
 * Whether the drawer has room for its expanded layout: expanded ("full
 * screen"), or a resizable drawer dragged at least DRAWER_WIDE_WIDTH wide
 * from lg. False outside a drawer. E.g. to reveal a master/detail sidebar
 * beside the content. For the expand toggle itself, read `expanded`.
 */
export function useDrawerWide(): boolean {
  const drawer = useOptionalDrawer();
  return Boolean(drawer && (drawer.expanded || drawer.wide));
}
