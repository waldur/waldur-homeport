export const OPEN = 'waldur/modal/OPEN';
export const CLOSE = 'waldur/modal/CLOSE';

export const openModalDialog = (component: string, params?: any) => ({
  type: OPEN,
  payload: {
    component,
    params,
  },
});

export const closeModalDialog = () => ({
  type: CLOSE,
});
