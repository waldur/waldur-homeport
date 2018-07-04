import * as React from 'react';

import './MessageButton.scss';

interface MessageButtonProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  iconClass: string;
}

export const MessageButton = (props: MessageButtonProps) => {
  const { title, children, iconClass } = props;
  return (
    <div className="message-button">
      <i className={iconClass}/>
      {title && (<div className="message-button__title">{title}</div>)}
      <div className="message-button__content">{children}</div>
    </div>
  );
};
