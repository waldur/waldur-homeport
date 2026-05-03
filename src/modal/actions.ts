import { ComponentType, ReactNode, useMemo } from 'react';
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
  // Memoize the returned object so that callers using these handlers in
  // useEffect / useCallback dependency arrays don't refire on every parent
  // render. Critical for ModalRoot in particular: it's the immediate parent
  // of every modal dialog rendered through this subsystem, so any extra
  // re-renders here cascade into the dialog tree (and have been observed to
  // tip latent React anti-patterns -- e.g. inline arrow `component` props on
  // redux-form `Field` -- into visible flakes on slow CI runners).
  // `dispatch` is stable across renders, so the deps array is just [dispatch].
  return useMemo(
    () => ({
      openDialog: <T>(
        component: ComponentType<T>,
        props?: T & AppModalProps,
      ) => {
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
    }),
    [dispatch],
  );
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
