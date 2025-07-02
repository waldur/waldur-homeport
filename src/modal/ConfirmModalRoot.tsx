import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { type RootState } from '@waldur/store/reducers';

import { closeModalDialog } from './actions';

interface TState {
  confirmComponent: React.ComponentType | string;
  confirmProps: any;
}

export const ConfirmModalRoot: FunctionComponent = () => {
  const { confirmComponent, confirmProps } = useSelector<
    { modal: TState },
    TState
  >((state: RootState) => state.modal);
  const { modalStyle, className, backdropClassName, resolve, ...rest } =
    confirmProps || {};
  const dispatch = useDispatch();
  const onHide = () => {
    if (resolve.deferred) resolve.deferred.reject();
    dispatch(closeModalDialog('HIDE_CONFIRM'));
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
