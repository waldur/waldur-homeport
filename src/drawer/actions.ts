import { ComponentType, useContext } from 'react';

import { DrawerContext, drawerServiceRef, DrawerProps } from './DrawerContext';
import { DRAWER_SHELL_CLASS, DrawerShellClass } from './shellClasses';

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

/**
 * The drawer context, or null outside a DrawerProvider: for components that
 * also render outside the drawer (a full-page chat, a story).
 */
export const useOptionalDrawer = () => useContext(DrawerContext);

/**
 * True while the drawer is open and showing the one with this shell class.
 * Checks `isOpen` too: closeDrawer keeps the shell class through the slide-out.
 */
export const useIsDrawerOpenWith = (shellClass: DrawerShellClass) => {
  const { isOpen, drawerProps } = useDrawer();
  return isOpen && drawerProps.shellClass === shellClass;
};

/** True while one of the floating-card drawers (AI, support, confirmation) is open. */
export const useIsFloatingDrawerOpen = () => {
  const { isOpen, drawerProps } = useDrawer();
  return (
    isOpen &&
    Object.values(DRAWER_SHELL_CLASS).includes(
      drawerProps.shellClass as DrawerShellClass,
    )
  );
};

export const DrawerService = {
  open: <P = any>(
    drawerComponent: ComponentType<P>,
    drawerProps?: P & DrawerProps,
  ) => {
    if (drawerServiceRef)
      drawerServiceRef.openDrawer(drawerComponent, drawerProps);
  },
  close: () => {
    if (drawerServiceRef) drawerServiceRef.closeDrawer();
  },
  render: <P = any>(
    drawerComponent: ComponentType<P>,
    drawerProps?: P & DrawerProps,
  ) => {
    if (drawerServiceRef)
      drawerServiceRef.renderDrawer(drawerComponent, drawerProps);
  },
};
