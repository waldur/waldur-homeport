import { $q } from '@waldur/core/services';

import { ConfirmationDialog } from './ConfirmationDialog';

export const OPEN = 'waldur/modal/OPEN';
export const CLOSE = 'waldur/modal/CLOSE';

export const openModalDialog = (
  modalComponent: React.ComponentType<any> | string,
  modalProps?: any,
) => ({
  type: 'SHOW_MODAL',
  modalComponent,
  modalProps,
});

export const closeModalDialog = () => ({
  type: 'HIDE_MODAL',
});

export const waitForConfirmation = (dispatch, title, body) => {
  const deferred = $q.defer();
  const params = {
    resolve: {
      deferred,
      title,
      body,
    },
  };
  dispatch(openModalDialog(ConfirmationDialog, params));
  return deferred.promise;
};
