import * as classNames from 'classnames';
import * as React from 'react';

interface Props {
  title: string;
  action: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

const ActionButton: React.SFC<Props> = ({ title, action, icon, className, disabled}: Props) => (
  <button
    type="button"
    className={classNames(className, {disabled})}
    onClick={action}>
      {icon && <i className={icon}/>}
      {' '}
      {title}
  </button>
);

ActionButton.defaultProps = {
  className: 'btn btn-sm btn-default',
};

export default ActionButton;
