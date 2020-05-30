import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

import { angular2react } from '@waldur/shims/angular2react';

import { closeModalDialog } from './actions';
import './ModalRoot.css';

const ModalRoot = ({ modalComponent, modalProps, onHide }) => (
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
        : React.createElement(modalComponent, { ...modalProps, close: onHide })
      : null}
  </Modal>
);

export default connect<
  {
    modalComponent: React.ComponentType;
    modalProps: any;
  },
  {
    onHide(): void;
  }
>(
  (state: any) => state.modal,
  dispatch => ({ onHide: () => dispatch(closeModalDialog()) }),
)(ModalRoot);
