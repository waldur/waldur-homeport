import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { isDirty } from 'redux-form';

import { translate } from '@waldur/i18n';
import { angular2react } from '@waldur/shims/angular2react';

import { closeModalDialog } from './actions';

import './ModalRoot.css';

interface TState {
  modalComponent: React.ComponentType | string;
  modalProps: any;
}

export default () => {
  const { modalComponent, modalProps } = useSelector<
    {
      modal: TState;
    },
    TState
  >((state) => state.modal);
  const dispatch = useDispatch();
  const isDirtyForm = useSelector((state) =>
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
      {modalComponent
        ? typeof modalComponent === 'string'
          ? React.createElement(angular2react(modalComponent, ['resolve']), {
              ...modalProps,
              close: onHide,
            })
          : React.createElement(modalComponent, {
              ...modalProps,
              close: onHide,
            })
        : null}
    </Modal>
  );
};
