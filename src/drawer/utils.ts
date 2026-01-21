/**
 * Checks if the Metronic drawer is currently visible.
 *
 * Note: This checks the actual DOM state rather than Redux state because
 * Metronic's drawer can be closed by multiple user interactions (ESC key,
 * clicking overlay, close button) that don't go through Redux actions.
 *
 * @returns true if the drawer is currently shown to the user
 */
export const isDrawerOpen = (): boolean => {
  const drawerEl = document.getElementById('kt_drawer');
  return drawerEl?.classList.contains('drawer-on') ?? false;
};
