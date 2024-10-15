import { ReactNode } from 'react';

import { createDeferred } from '@waldur/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

export type DialogSizeType = 'sm' | 'lg' | 'xl';

export const openModalDialog = <P = any>(
  modalComponent: React.ComponentType<P>,
  modalProps?: P & {
    size?: DialogSizeType;
    backdrop?: 'static' | true | false;
    formId?: string;
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
  forDeletion?: boolean,
  nb?: ReactNode,
) => {
  const deferred = createDeferred();
  const params = {
    resolve: {
      deferred,
      title,
      body,
      nb,
    },
  };
  dispatch(
    openModalDialog(
      forDeletion ? DeleteConfirmationDialog : ConfirmationDialog,
      forDeletion ? { ...params, size: 'sm' } : params,
    ),
  );
  return deferred.promise;
};
