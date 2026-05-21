import { ComponentType, ReactNode, useContext } from 'react';

import { ModalContext, modalServiceRef } from './ModalContext';
import { ModalAction, AppModalProps, ConfirmationOptions } from './types';

export type { AppModalProps, ConfirmationOptions };

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalService = {
  open: <P = any>(
    modalComponent: ComponentType<P> | string,
    modalProps?: P & AppModalProps,
  ) => {
    if (modalServiceRef) modalServiceRef.openDialog(modalComponent, modalProps);
  },
  close: (type: ModalAction = 'HIDE_MODAL') => {
    if (modalServiceRef) modalServiceRef.closeDialog(type);
  },
  confirm: (
    title: ReactNode,
    body: ReactNode,
    options?: ConfirmationOptions,
  ) => {
    if (modalServiceRef) return modalServiceRef.confirm(title, body, options);
    return Promise.reject('ModalProvider not initialized');
  },
};
