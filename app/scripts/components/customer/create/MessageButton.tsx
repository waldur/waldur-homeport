import * as classNames from 'classnames';
import * as React from 'react';

import './MessageButton.scss';

interface MessageButtonProps {
  title?: any;
  children: React.ReactNode;
  wrapperClassName: string;
}

export const MessageButton = (props: MessageButtonProps) => {
  const { title, children, wrapperClassName } = props;
  return ((
    <div className={classNames('message-button', wrapperClassName)}>
      {title && (<div className="message-button__title">{title}</div>)}
      <div className="message-button__content">{children}</div>
    </div>
  ));
};
