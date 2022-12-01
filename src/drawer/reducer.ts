import { DrawerComponent } from '@waldur/metronic/assets/ts/components';

const initialState = {
  drawerComponent: null,
  drawerProps: {},
};

export const reducer = (state = initialState, action) => {
  const drawer = DrawerComponent.getInstance('kt_drawer');
  switch (action.type) {
    case 'SHOW_DRAWER':
      drawer.show();
      return {
        drawerComponent: action.drawerComponent,
        drawerProps: action.drawerProps,
      };
    case 'HIDE_DRAWER':
      drawer.hide();
      return initialState;
    default:
      return state;
  }
};
