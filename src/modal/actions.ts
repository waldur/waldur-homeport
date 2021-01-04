import { ReactNode } from 'react';

import { createDeferred } from '@waldur/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';

export const OPEN = 'waldur/modal/OPEN';
export const CLOSE = 'waldur/modal/CLOSE';

export const openModalDialog = <P = any>(
  modalComponent: React.ComponentType<P>,
  modalProps?: P & { size?: 'lg' | 'xl' },
) => ({
  type: 'SHOW_MODAL',
  modalComponent,
  modalProps,
});

export const closeModalDialog = () => ({
  type: 'HIDE_MODAL',
});

export const waitForConfirmation = (
  dispatch,
  title: ReactNode,
  body: ReactNode,
) => {
  const deferred = createDeferred();
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
