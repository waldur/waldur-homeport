import * as React from 'react';

import './MessageButton.scss';

interface MessageButtonProps {
  title?: React.ReactNode;
  iconClass: string;
}

export const MessageButton: React.FC<MessageButtonProps> = ({
  title,
  children,
  iconClass,
}) => (
  <div className="message-button">
    <i className={iconClass} />
    {title && <div className="message-button__title">{title}</div>}
    <div className="message-button__content">{children}</div>
  </div>
);
