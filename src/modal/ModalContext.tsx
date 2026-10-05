import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
  useRef,
  MutableRefObject,
} from 'react';

import { createDeferred } from '@/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { AppModalProps, ConfirmationOptions, ModalAction } from './types';

interface ModalContextValue {
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

// Global reference for ModalService to use outside of React tree
export let modalServiceRef: Pick<
  ModalContextValue,
  'openDialog' | 'closeDialog' | 'confirm'
> | null = null;

/**
 * The element to focus when a dialog closes: the one focused when it opened,
 * or, for a row of a Radix menu, which unmounts with the menu as the dialog
 * opens, the menu's trigger.
 */
const getReturnFocusTarget = (): HTMLElement | null => {
  const active = document.activeElement as HTMLElement | null;
  const menu = active?.closest<HTMLElement>('[role="menu"]');
  if (menu?.id) {
    const trigger = document.querySelector<HTMLElement>(
      `[aria-controls="${CSS.escape(menu.id)}"]`,
    );
    if (trigger) return trigger;
  }
  return active;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modalComponent, setModalComponent] = useState<
    ComponentType<any> | string | null
  >(null);
  const [modalProps, setModalProps] = useState<any>({});
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [confirmComponent, setConfirmComponent] = useState<
    ComponentType<any> | string | null
  >(null);
  const [confirmProps, setConfirmProps] = useState<any>({});

  const openDialog = useCallback(
    <T,>(component: ComponentType<T> | string, props?: T & AppModalProps) => {
      if (!modalComponent) {
        returnFocusRef.current = getReturnFocusTarget();
      }
      setModalComponent(() => component);
      setModalProps(props || {});
    },
    [modalComponent],
  );

  const closeDialog = useCallback((type: ModalAction = 'HIDE_MODAL') => {
    if (type === 'HIDE_MODAL') {
      setModalComponent(null);
      setModalProps({});
    } else if (type === 'HIDE_CONFIRM') {
      setConfirmComponent(null);
      setConfirmProps({});
    }
  }, []);

  const confirm = useCallback(
    (title: ReactNode, body: ReactNode, options: ConfirmationOptions = {}) => {
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

      setConfirmComponent(() =>
        options.forDeletion ? DeleteConfirmationDialog : ConfirmationDialog,
      );
      setConfirmProps(options.forDeletion ? { size: 'sm', ...params } : params);

      return deferred.promise;
    },
    [],
  );

  // Update the global ref
  modalServiceRef = { openDialog, closeDialog, confirm };

  return (
    <ModalContext.Provider
      value={{
        modalComponent,
        modalProps,
        confirmComponent,
        confirmProps,
        openDialog,
        closeDialog,
        returnFocusRef,
        confirm,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
