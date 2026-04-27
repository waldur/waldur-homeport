import { ReactNode } from 'react';
import { ModalProps } from 'react-bootstrap';

import { createDeferred } from '@/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ModalAction, ConfirmationDialogType, DialogSizeType } from './types';

export interface AppModalProps extends Omit<ModalProps, 'size'> {
  size?: DialogSizeType;
  formId?: string;
}

export const openModalDialog = <P = any>(
  modalComponent: React.ComponentType<P>,
  modalProps?: P & AppModalProps,
  type: ModalAction = 'SHOW_MODAL',
) => ({
  type,
  modalComponent,
  modalProps,
});

export const closeModalDialog = (type: ModalAction = 'HIDE_MODAL') => ({
  type,
});

export const waitForConfirmation = (
  dispatch,
  title: ReactNode,
  body: ReactNode,
  options: {
    forDeletion?: boolean;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
    size?: DialogSizeType;
    positiveButtonVariant?: string;
    onlyPositiveButton?: boolean;
    iconNode?: ReactNode;
    showInput?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    inputRequired?: boolean;
    showRouterSelect?: boolean;
    tenantUuid?: string;
  } = {},
) => {
  const deferred = createDeferred();
  const params = {
    resolve: {
      deferred,
      title,
      body,
      ...options,
    },
    size: options.size,
  };
  dispatch(
    openModalDialog(
      options.forDeletion ? DeleteConfirmationDialog : ConfirmationDialog,
      options.forDeletion ? { size: 'sm', ...params } : params,
      'SHOW_CONFIRM',
    ),
  );
  return deferred.promise;
};
