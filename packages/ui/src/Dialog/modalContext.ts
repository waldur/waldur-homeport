import {
  ComponentType,
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
} from 'react';

import type {
  AppModalProps,
  ConfirmationOptions,
  ModalAction,
} from './modalTypes';

export interface ModalContextValue {
  modalComponent: ComponentType<any> | string | null;
  modalProps: any;
  confirmComponent: ComponentType<any> | string | null;
  confirmProps: any;
  openDialog: <T>(
    component: ComponentType<T> | string,
    props?: T & AppModalProps,
  ) => void;
  closeDialog: (type?: ModalAction) => void;
  /** Where focus goes when the dialog has closed (see ModalRoot). */
  returnFocusRef: MutableRefObject<HTMLElement | null>;
  confirm: (
    title: ReactNode,
    body: ReactNode,
    options?: ConfirmationOptions,
  ) => Promise<any>;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

type ModalServiceTarget = Pick<
  ModalContextValue,
  'openDialog' | 'closeDialog' | 'confirm'
>;

let modalServiceTarget: ModalServiceTarget | null = null;

/** ModalProvider registers itself here, for ModalService. */
export const setModalServiceTarget = (target: ModalServiceTarget | null) => {
  modalServiceTarget = target;
};

/** The open dialog, its props and the open/close/confirm actions. */
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

/** useModal's actions for code outside the React tree. */
export const ModalService = {
  open: <P = any>(
    modalComponent: ComponentType<P> | string,
    modalProps?: P & AppModalProps,
  ) => {
    modalServiceTarget?.openDialog(modalComponent, modalProps);
  },
  close: (type: ModalAction = 'HIDE_MODAL') => {
    modalServiceTarget?.closeDialog(type);
  },
  confirm: (
    title: ReactNode,
    body: ReactNode,
    options?: ConfirmationOptions,
  ) => {
    if (modalServiceTarget) {
      return modalServiceTarget.confirm(title, body, options);
    }
    return Promise.reject('ModalProvider not initialized');
  },
};
