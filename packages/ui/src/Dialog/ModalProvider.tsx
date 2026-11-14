import {
  ComponentType,
  FC,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ConfirmationDialog,
  DeleteConfirmationDialog,
} from './ConfirmationDialog';
import {
  ModalContext,
  ModalStateContext,
  setModalServiceTarget,
} from './modalContext';
import type {
  AppModalProps,
  ConfirmationOptions,
  ModalAction,
} from './modalTypes';

const createDeferred = () => {
  const deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

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

/**
 * Holds the one open dialog and the one open confirmation, for
 * `useModal()`/`ModalService` to open and ModalRoot/ConfirmModalRoot to
 * render. Mount it once, around the app and the two roots.
 */
export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modalComponent, setModalComponent] = useState<
    ComponentType<any> | string | null
  >(null);
  const [modalProps, setModalProps] = useState<any>({});
  const returnFocusRef = useRef<HTMLElement | null>(null);
  // Whether a dialog is open, for openDialog to tell opening from replacing
  // without depending on the state (which would change its identity).
  const isOpenRef = useRef(false);

  const [confirmComponent, setConfirmComponent] = useState<
    ComponentType<any> | string | null
  >(null);
  const [confirmProps, setConfirmProps] = useState<any>({});

  const openDialog = useCallback(
    <T,>(component: ComponentType<T> | string, props?: T & AppModalProps) => {
      if (!isOpenRef.current) {
        returnFocusRef.current = getReturnFocusTarget();
      }
      isOpenRef.current = true;
      setModalComponent(() => component);
      setModalProps(props || {});
    },
    [],
  );

  const closeDialog = useCallback((type: ModalAction = 'HIDE_MODAL') => {
    if (type === 'HIDE_MODAL') {
      isOpenRef.current = false;
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

  useLayoutEffect(() => {
    setModalServiceTarget({ openDialog, closeDialog, confirm });
    return () => {
      setModalServiceTarget(null);
    };
  }, [openDialog, closeDialog, confirm]);

  // Two contexts: the actions never change, so the hundreds of components
  // that only open or close dialogs don't re-render when one opens; the
  // state changes with every dialog and is read by the roots alone.
  const actions = useMemo(
    () => ({ openDialog, closeDialog, confirm, returnFocusRef }),
    [openDialog, closeDialog, confirm],
  );
  const state = useMemo(
    () => ({ modalComponent, modalProps, confirmComponent, confirmProps }),
    [modalComponent, modalProps, confirmComponent, confirmProps],
  );

  return (
    <ModalContext.Provider value={actions}>
      <ModalStateContext.Provider value={state}>
        {children}
      </ModalStateContext.Provider>
    </ModalContext.Provider>
  );
};
