import { ErrorBoundary } from '@sentry/react';
import React, { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { isDirty } from 'redux-form';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { closeModalDialog } from './actions';

import './ModalRoot.css';

interface TState {
  modalComponent: React.ComponentType | string;
  modalProps: any;
}

export const ModalRoot: FunctionComponent = () => {
  const { modalComponent, modalProps } = useSelector<
    {
      modal: TState;
    },
    TState
  >((state: RootState) => state.modal);
  const dispatch = useDispatch();
  const isDirtyForm = useSelector((state: RootState) =>
    modalProps?.formId ? isDirty(modalProps.formId)(state) : false,
  );
  const onHide = () => {
    if (
      isDirtyForm &&
      !confirm(
        translate(
          'You have entered data in form. When dialog is closed form data would be lost.',
        ),
      )
    ) {
      return;
    }
    dispatch(closeModalDialog());
  };
  return (
    <Modal
      show={modalComponent ? true : false}
      onHide={onHide}
      bsSize={modalProps?.size}
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
