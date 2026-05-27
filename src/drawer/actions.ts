import { ComponentType, useContext } from 'react';

import { DrawerContext, drawerServiceRef, DrawerProps } from './DrawerContext';

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
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
