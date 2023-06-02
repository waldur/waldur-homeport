import { ReactNode } from 'react';

import { createDeferred } from '@waldur/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';

export type DialogSizeType = 'lg' | 'xl';

export const openModalDialog = <P = any>(
  modalComponent: React.ComponentType<P>,
  modalProps?: P & {
    size?: DialogSizeType;
    backdrop?: 'static' | true | false;
  },
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
