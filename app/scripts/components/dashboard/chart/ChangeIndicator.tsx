import * as classNames from 'classnames';
import * as React from 'react';

interface Props {
  change: number;
}

const textClass = change => (
  classNames('font-bold m-b-sm', {
    'text-info': change > 0,
    'text-warning': change < 0,
    'text-muted': !change,
  })
);

const iconClass = change => (
  classNames('fa', {
    'fa-level-up': change > 0,
    'fa-level-down': change < 0,
    'fa-bolt': !change,
  })
);

const ChangeIndicator = ({ change }: Props) => {
  return (
    <div className={textClass(change)}>
      <span className="pull-right">
        {change || 0}%
        <i className={iconClass(change)}/>
      </span>
    </div>
  );
};

export default ChangeIndicator;
