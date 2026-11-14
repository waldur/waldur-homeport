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

/**
 * The open/close/confirm actions. Their identities never change, so a
 * component that only opens or closes dialogs — every row action, every
 * CloseDialogButton — does not re-render when a dialog opens or closes.
 */
export interface ModalContextValue {
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

/** The open dialog and the open confirmation, for the roots that render them. */
export interface ModalStateValue {
  modalComponent: ComponentType<any> | string | null;
  modalProps: any;
  confirmComponent: ComponentType<any> | string | null;
  confirmProps: any;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalStateContext = createContext<ModalStateValue | null>(null);

type ModalServiceTarget = Pick<
  ModalContextValue,
  'openDialog' | 'closeDialog' | 'confirm'
>;

let modalServiceTarget: ModalServiceTarget | null = null;

/** ModalProvider registers itself here, for ModalService. */
export const setModalServiceTarget = (target: ModalServiceTarget | null) => {
  modalServiceTarget = target;
};

/** The open/close/confirm actions; stable across dialogs opening and closing. */
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

/**
 * The open dialog and confirmation. Reading it re-renders the caller whenever
 * a dialog opens or closes, so only the roots and the rare component that has
 * to know whether a dialog is open use it.
 */
export const useModalState = () => {
  const context = useContext(ModalStateContext);
  if (!context) {
    throw new Error('useModalState must be used within a ModalProvider');
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
