import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

interface ModalDialogProps {
  title: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
  children?: React.ReactNode;
}

export const ModalDialog: FunctionComponent<ModalDialogProps> = (props) => (
  <div>
    <div className="modal-header">
      <h3 className="modal-title">{props.title}</h3>
    </div>
    <div className={classNames('modal-body', props.bodyClassName)}>
      {props.children}
    </div>
    {props.footer && <div className="modal-footer">{props.footer}</div>}
  </div>
);
