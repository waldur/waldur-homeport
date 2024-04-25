import { DrawerStateProps } from './reducer';

export const openDrawerDialog = <P = any>(
  drawerComponent: DrawerStateProps<P>['drawerComponent'],
  drawerProps?: DrawerStateProps<P>['drawerProps'],
) => ({
  type: 'SHOW_DRAWER',
  drawerComponent,
  drawerProps,
});

export const renderDrawerDialog = <P = any>(
  drawerComponent: DrawerStateProps<P>['drawerComponent'],
  drawerProps?: DrawerStateProps<P>['drawerProps'],
) => ({
  type: 'RENDER_DRAWER',
  drawerComponent,
  drawerProps,
});

export const closeDrawerDialog = (drawerProps = null) => ({
  type: 'HIDE_DRAWER',
  drawerProps,
});
