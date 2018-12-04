import * as classNames from 'classnames';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

interface ActionButtonProps {
  title: string;
  action: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

const wrapTooltip = (label, children) =>
  label ? <Tooltip label={label} id="button-tooltip">{children}</Tooltip> : children;

const ActionButton: React.SFC<ActionButtonProps> = ({ title, action, icon, className, disabled, tooltip }: ActionButtonProps) =>
  wrapTooltip(tooltip, (
  <button
    type="button"
    className={classNames(className, {disabled})}
    onClick={action}>
      {icon && <i className={icon}/>}
      {' '}
      {title}
  </button>
));

ActionButton.defaultProps = {
  className: 'btn btn-sm btn-default',
};

export default ActionButton;
