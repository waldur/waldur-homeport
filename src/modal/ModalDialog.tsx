import * as classNames from 'classnames';
import * as React from 'react';

interface Props {
  title: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
  children?: React.ReactNode;
}

export const ModalDialog = (props: Props) => (
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
