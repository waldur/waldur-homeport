import React, {
  createContext,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
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

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modalComponent, setModalComponent] = useState<
    ComponentType<any> | string | null
  >(null);
  const [modalProps, setModalProps] = useState<any>({});

  const [confirmComponent, setConfirmComponent] = useState<
    ComponentType<any> | string | null
  >(null);
  const [confirmProps, setConfirmProps] = useState<any>({});

  const openDialog = useCallback(
    <T,>(component: ComponentType<T> | string, props?: T & AppModalProps) => {
      setModalComponent(() => component);
      setModalProps(props || {});
    },
    [],
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
        confirm,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
