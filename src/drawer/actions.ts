import React from 'react';

type DialogSizeType = 'lg' | 'xl';

export const openDrawerDialog = <P = any>(
  drawerComponent: React.ComponentType<P>,
  drawerProps?: P & {
    title?: React.ReactNode;
    footer?: React.ReactNode;
    size?: DialogSizeType;
    props?: any;
  },
) => ({
  type: 'SHOW_DRAWER',
  drawerComponent,
  drawerProps,
});

export const closeDrawerDialog = () => ({
  type: 'HIDE_DRAWER',
});
