import classNames from 'classnames';
import React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export interface ActionButtonProps {
  title: string;
  action: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const wrapTooltip = (label, children, rest?) =>
  label ? (
    <Tooltip label={label} id="button-tooltip" {...rest}>
      {children}
    </Tooltip>
  ) : (
    children
  );

export const ActionButton: React.FC<ActionButtonProps> = (props) =>
  wrapTooltip(
    props.tooltip,
    <button
      type="button"
      className={classNames(props.className, { disabled: props.disabled })}
      onClick={props.action}
    >
      {props.icon && <i className={props.icon} />} {props.title}
    </button>,
  );

ActionButton.defaultProps = {
  className: 'btn btn-sm btn-default',
};
