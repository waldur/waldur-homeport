import { ComponentType, useContext } from 'react';

import { DrawerContext, drawerServiceRef, DrawerProps } from './DrawerContext';
import { DrawerShellClass } from './shellClasses';

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

/**
 * True while the drawer is open and showing the one with this shell class.
 * Checks `isOpen` too: closeDrawer keeps the shell class through the slide-out.
 */
export const useIsDrawerOpenWith = (shellClass: DrawerShellClass) => {
  const { isOpen, drawerProps } = useDrawer();
  return isOpen && drawerProps.shellClass === shellClass;
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
