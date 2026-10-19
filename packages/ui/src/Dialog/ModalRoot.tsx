import {
  ComponentType,
  createElement,
  FC,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { DirtyFormContext } from './DirtyFormContext';
import { ModalShell } from './Modal';
import { useModal } from './modalContext';

export interface ModalRootProps {
  /**
   * Wraps the open dialog, so a crash inside it shows a fallback instead of
   * unmounting the app: the app passes its Sentry boundary, a micro-app its
   * shell's. None by default.
   */
  errorBoundary?: ComponentType<{ children: ReactNode }>;
}

/**
 * Renders the dialog `openDialog()` opened, in a ModalShell. The dialog
 * component gets openDialog's props plus `close`.
 *
 * A form inside that reports unsaved input (DirtyFormContext) makes closing
 * ask first.
 */
export const ModalRoot: FC<ModalRootProps> = ({ errorBoundary }) => {
  const { modalComponent, modalProps, closeDialog, confirm, returnFocusRef } =
    useModal();

  const lastContentRef = useRef<{
    component: ComponentType<any> | string;
    props: any;
  } | null>(null);

  if (modalComponent) {
    lastContentRef.current = {
      component: modalComponent,
      props: modalProps,
    };
  }

  const activeContent = modalComponent
    ? { component: modalComponent, props: modalProps }
    : lastContentRef.current;

  const {
    modalStyle,
    className,
    dialogClassName,
    backdropClassName,
    size,
    centered = true,
    scrollable = true,
    keyboard,
    backdrop,
    animation,
    title,
  } = activeContent?.props || {};
  const Boundary = errorBoundary ?? Fragment;

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(false);
  }, [modalComponent]);

  const onHide = async () => {
    if (isDirty) {
      try {
        await confirm(
          translate('Closing dialog'),
          translate(
            'You have entered data in form. When dialog is closed form data would be lost.',
          ),
          {
            size: 'sm',
            positiveButton: translate('OK'),
            negativeButton: translate('Cancel'),
            positiveButtonVariant: 'warning',
          },
        );
      } catch {
        return;
      }
    }
    closeDialog();
  };

  const handleCloseAutoFocus = (event: Event) => {
    const target = returnFocusRef?.current;
    if (returnFocusRef) returnFocusRef.current = null;
    if (target?.isConnected) {
      event.preventDefault();
      target.focus();
    }
  };

  const ComponentToRender = activeContent?.component;

  return (
    <ModalShell
      open={Boolean(modalComponent)}
      onHide={onHide}
      title={title}
      size={size}
      centered={centered}
      scrollable={scrollable}
      className={className}
      dialogClassName={dialogClassName}
      backdropClassName={backdropClassName}
      modalStyle={modalStyle}
      keyboard={keyboard}
      backdrop={backdrop}
      animation={animation}
      onCloseAutoFocus={handleCloseAutoFocus}
    >
      <Boundary>
        <DirtyFormContext.Provider value={{ setIsDirty }}>
          {ComponentToRender
            ? createElement(ComponentToRender, {
                ...activeContent?.props,
                close: onHide,
              })
            : null}
        </DirtyFormContext.Provider>
      </Boundary>
    </ModalShell>
  );
};

/**
 * Renders the confirmation `confirm()` opened, on the confirm layer above
 * ModalRoot. Closing it rejects the confirm's promise.
 */
export const ConfirmModalRoot: FC<ModalRootProps> = ({ errorBoundary }) => {
  const { confirmComponent, confirmProps, closeDialog } = useModal();

  const lastContentRef = useRef<{
    component: ComponentType<any> | string;
    props: any;
  } | null>(null);

  if (confirmComponent) {
    lastContentRef.current = {
      component: confirmComponent,
      props: confirmProps,
    };
  }

  const activeContent = confirmComponent
    ? { component: confirmComponent, props: confirmProps }
    : lastContentRef.current;

  const {
    modalStyle,
    className,
    dialogClassName,
    backdropClassName,
    resolve,
    size = 'sm',
    animation,
  } = activeContent?.props || {};
  const Boundary = errorBoundary ?? Fragment;

  const onHide = () => {
    if (resolve?.deferred) resolve.deferred.reject();
    closeDialog('HIDE_CONFIRM');
  };

  const ComponentToRender = activeContent?.component;

  return (
    <ModalShell
      open={Boolean(confirmComponent)}
      onHide={onHide}
      title={resolve?.title}
      size={size}
      centered
      className={className}
      layer="confirm"
      dialogClassName={dialogClassName}
      backdropClassName={backdropClassName}
      modalStyle={modalStyle}
      animation={animation}
    >
      <Boundary>
        {ComponentToRender
          ? createElement(ComponentToRender, {
              ...activeContent?.props,
              close: onHide,
            })
          : null}
      </Boundary>
    </ModalShell>
  );
};
