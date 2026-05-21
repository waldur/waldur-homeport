import { ErrorBoundary } from '@sentry/react';
import React, { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

import { DirtyFormContext } from '@/core/DirtyFormContext';
import { ErrorMessage } from '@/ErrorMessage';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import './ModalRoot.css';

export const ModalRoot: FunctionComponent = () => {
  const { modalComponent, modalProps, closeDialog, confirm } = useModal();
  const {
    formId: _formId,
    modalStyle,
    // Filter out custom props that shouldn't be passed to Modal DOM element
    resolve: _resolve,
    initialValues: _initialValues,
    roleTypes: _roleTypes,
    refetch: _refetch,
    change: _change,
    ...rest
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
  return (
    <Modal
      show={modalComponent ? true : false}
      onHide={onHide}
      style={modalStyle}
      centered
      enforceFocus={false}
      scrollable
      {...rest}
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
    </Modal>
  );
};
