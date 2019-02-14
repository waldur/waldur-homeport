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

export const wrapTooltip = (label, children) =>
  label ? <Tooltip label={label} id="button-tooltip">{children}</Tooltip> : children;

const ActionButton: React.SFC<ActionButtonProps> = props =>
  wrapTooltip(props.tooltip, (
  <button
    type="button"
    className={classNames(props.className, {disabled: props.disabled})}
    onClick={props.action}>
      {props.icon && <i className={props.icon}/>}
      {' '}
      {props.title}
  </button>
));

ActionButton.defaultProps = {
  className: 'btn btn-sm btn-default',
};

export default ActionButton;
