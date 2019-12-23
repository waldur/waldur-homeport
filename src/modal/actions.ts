import { $q } from '@waldur/core/services';

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

export const waitForConfirmation = (dispatch, title, body) => {
  const deferred = $q.defer();
  const params = {
    resolve: {
      deferred,
      title,
      body,
    },
    size: 'md',
  };
  dispatch(openModalDialog('ConfirmationDialog', params));
  return deferred.promise;
};
