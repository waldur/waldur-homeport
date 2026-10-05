import { ErrorBoundary } from '@sentry/react';
import React, { FunctionComponent } from 'react';

import { DirtyFormContext } from '@/core/DirtyFormContext';
import { ErrorMessage } from '@/ErrorMessage';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ModalShell } from './ModalShell';

export const ModalRoot: FunctionComponent = () => {
  const { modalComponent, modalProps, closeDialog, confirm, returnFocusRef } =
    useModal();
  const {
    formId: _formId,
    modalStyle,
    enforceFocus: _enforceFocus,
    resolve: _resolve,
    initialValues: _initialValues,
    roleTypes: _roleTypes,
    refetch: _refetch,
    change: _change,
    className,
    dialogClassName,
    backdropClassName,
    size,
    centered = true,
    scrollable = true,
    keyboard,
    backdrop,
    animation,
  } = modalProps || {};

  const [isDirtyContext, setIsDirtyContext] = React.useState(false);
  const isDirtyForm = isDirtyContext;

  const onHide = async () => {
    if (isDirtyForm) {
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

  return (
    <ModalShell
      open={Boolean(modalComponent)}
      onHide={onHide}
      title={modalProps?.title}
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
      <ErrorBoundary fallback={ErrorMessage}>
        <DirtyFormContext.Provider value={{ setIsDirty: setIsDirtyContext }}>
          {modalComponent
            ? React.createElement(modalComponent, {
                ...modalProps,
                close: onHide,
              })
            : null}
        </DirtyFormContext.Provider>
      </ErrorBoundary>
    </ModalShell>
  );
};
