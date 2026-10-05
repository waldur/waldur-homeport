import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { ErrorMessage } from '@/ErrorMessage';
import { useModal } from '@/modal/actions';

import { ModalShell } from './ModalShell';

export const ConfirmModalRoot: FunctionComponent = () => {
  const { confirmComponent, confirmProps, closeDialog } = useModal();
  const {
    modalStyle,
    className,
    dialogClassName,
    backdropClassName,
    resolve,
    size = 'sm',
    animation,
  } = confirmProps || {};

  const onHide = () => {
    if (resolve?.deferred) resolve.deferred.reject();
    closeDialog('HIDE_CONFIRM');
  };

  return (
    <ModalShell
      open={Boolean(confirmComponent)}
      onHide={onHide}
      title={resolve?.title}
      size={size}
      centered
      className={classNames('confirm-modal', className)}
      dialogClassName={dialogClassName}
      backdropClassName={classNames('confirm-backdrop', backdropClassName)}
      modalStyle={modalStyle}
      animation={animation}
    >
      <ErrorBoundary fallback={ErrorMessage}>
        {confirmComponent
          ? React.createElement(confirmComponent, {
              ...confirmProps,
              close: onHide,
            })
          : null}
      </ErrorBoundary>
    </ModalShell>
  );
};
