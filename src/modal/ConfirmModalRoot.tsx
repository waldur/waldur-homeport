import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

import { ErrorMessage } from '@/ErrorMessage';
import { useModal } from '@/modal/actions';

export const ConfirmModalRoot: FunctionComponent = () => {
  const { confirmComponent, confirmProps, closeDialog } = useModal();
  const { modalStyle, className, backdropClassName, resolve, ...rest } =
    confirmProps || {};
  const onHide = () => {
    if (resolve.deferred) resolve.deferred.reject();
    closeDialog('HIDE_CONFIRM');
  };
  return (
    <Modal
      show={confirmComponent ? true : false}
      onHide={onHide}
      style={modalStyle}
      centered
      className={classNames('confirm-modal', className)}
      backdropClassName={classNames('confirm-backdrop', backdropClassName)}
      {...rest}
    >
      <ErrorBoundary fallback={ErrorMessage}>
        {confirmComponent
          ? React.createElement(confirmComponent, {
              ...confirmProps,
              close: onHide,
            })
          : null}
      </ErrorBoundary>
    </Modal>
  );
};
