import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

interface ModalDialogProps {
  title: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
  bodyClassName?: string;
  children?: React.ReactNode;
}

export const ModalDialog: FunctionComponent<ModalDialogProps> = (props) => (
  <div>
    <Modal.Header closeButton={props.closeButton}>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
    <div className={classNames('modal-body', props.bodyClassName)}>
      {props.children}
    </div>
    {props.footer && <div className="modal-footer">{props.footer}</div>}
  </div>
);

ModalDialog.defaultProps = {
  closeButton: false,
};
