import { ComponentType, ReactNode } from 'react';
import { ModalProps } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { createDeferred } from '@/core/utils';
import store from '@/store/store';

import { ConfirmationDialog } from './ConfirmationDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ModalAction, ConfirmationDialogType, DialogSizeType } from './types';

export interface AppModalProps extends Omit<ModalProps, 'size'> {
  size?: DialogSizeType;
  formId?: string;
}

export interface ConfirmationOptions {
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
}

const openModalDialog = <P = any>(
  modalComponent: ComponentType<P>,
  modalProps?: P & AppModalProps,
  type: ModalAction = 'SHOW_MODAL',
) => ({
  type,
  modalComponent,
  modalProps,
});

const closeModalDialog = (type: ModalAction = 'HIDE_MODAL') => ({
  type,
});

const confirmWith = (
  dispatchFn: (action: any) => void,
  title: ReactNode,
  body: ReactNode,
  options: ConfirmationOptions = {},
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
  dispatchFn(
    openModalDialog(
      options.forDeletion ? DeleteConfirmationDialog : ConfirmationDialog,
      options.forDeletion ? { size: 'sm', ...params } : params,
      'SHOW_CONFIRM',
    ),
  );
  return deferred.promise;
};

export const useModal = () => {
  const dispatch = useDispatch();
  return {
    openDialog: <T>(component: ComponentType<T>, props?: T & AppModalProps) => {
      dispatch(openModalDialog(component, props));
    },
    closeDialog: (type: ModalAction = 'HIDE_MODAL') => {
      dispatch(closeModalDialog(type));
    },
    confirm: (
      title: ReactNode,
      body: ReactNode,
      options?: ConfirmationOptions,
    ) => confirmWith(dispatch, title, body, options),
  };
};

export const ModalService = {
  open: <P = any>(
    modalComponent: ComponentType<P>,
    modalProps?: P & AppModalProps,
  ) => store.dispatch(openModalDialog(modalComponent, modalProps)),
  close: (type: ModalAction = 'HIDE_MODAL') =>
    store.dispatch(closeModalDialog(type)),
  confirm: (title: ReactNode, body: ReactNode, options?: ConfirmationOptions) =>
    confirmWith(store.dispatch, title, body, options),
};
