import * as React from 'react';

interface Props {
  title: string;
  className?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Panel = ({ title, children, className, actions }: Props) => (
  <div className={'ibox ' + className}>
    <div className="ibox-title">
      <h5>{title}</h5>
      {actions}
    </div>
    <div className="ibox-content">
      {children}
    </div>
  </div>
);

export default Panel;
