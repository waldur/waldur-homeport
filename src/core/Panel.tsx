import * as classNames from 'classnames';
import * as React from 'react';

interface PanelProps {
  title?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Panel: React.SFC<PanelProps> = ({ title, children, className, actions }) => (
  <div className={classNames('ibox', className)}>
    {title && (
      <div className="ibox-title">
        <h5>{title}</h5>
        {actions}
      </div>
    )}
    <div className="ibox-content">
      {children}
    </div>
  </div>
);

export default Panel;
