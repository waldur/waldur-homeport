import { DrawerComponent } from '@waldur/metronic/components';

export interface DrawerStateProps<P = any> {
  drawerComponent: React.ComponentType<P>;
  status: 'closed' | 'opened' | 'rendered';
  drawerProps?: P & {
    title?: React.ReactNode;
    subtitle?: string;
    footer?: React.ComponentType;
    width?: string;
    props?: any;
  };
}

const initialState: DrawerStateProps = {
  drawerComponent: null,
  status: 'closed',
  drawerProps: {
    width: '800px',
  },
};

export const reducer = (state = initialState, action): DrawerStateProps => {
  const drawer = DrawerComponent.getInstance('kt_drawer');
  const newProps = { ...initialState.drawerProps };
  Object.assign(newProps, action.drawerProps);

  switch (action.type) {
    case 'RENDER_DRAWER':
      if (state.status !== 'opened') {
        return {
          drawerComponent: action.drawerComponent,
          status: 'rendered',
          drawerProps: newProps,
        };
      }
      return state;
    case 'SHOW_DRAWER':
      drawer.show();
      return {
        drawerComponent: action.drawerComponent,
        status: 'opened',
        drawerProps: newProps,
      };
    case 'HIDE_DRAWER':
      drawer.hide();
      return {
        drawerComponent: null,
        status: 'closed',
        drawerProps: newProps,
      };
    default:
      return state;
  }
};
