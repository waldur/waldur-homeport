import { ErrorBoundary } from '@sentry/react';
import React, { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { isDirty } from 'redux-form';

import { ErrorMessage } from '@/ErrorMessage';
import { translate } from '@/i18n';
import { type RootState } from '@/store/reducers';

import { closeModalDialog, waitForConfirmation } from './actions';

import './ModalRoot.css';

interface TState {
  modalComponent: React.ComponentType | string;
  modalProps: any;
}

export const ModalRoot: FunctionComponent = () => {
  const { modalComponent, modalProps } = useSelector<{ modal: TState }, TState>(
    (state: RootState) => state.modal,
  );
  const {
    formId,
    modalStyle,
    // Filter out custom props that shouldn't be passed to Modal DOM element
    resolve: _resolve,
    initialValues: _initialValues,
    roleTypes: _roleTypes,
    refetch: _refetch,
    change: _change,
    ...rest
  } = modalProps || {};

  const dispatch = useDispatch();
  const isDirtyForm = useSelector((state: RootState) =>
    formId ? isDirty(formId)(state) : false,
  );
  const onHide = async () => {
    if (isDirtyForm) {
      try {
        await waitForConfirmation(
          dispatch,
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
    dispatch(closeModalDialog());
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
        {modalComponent
          ? React.createElement(modalComponent, {
              ...modalProps,
              close: onHide,
            })
          : null}
      </ErrorBoundary>
    </Modal>
  );
};
