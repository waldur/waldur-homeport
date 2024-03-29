import classNames from 'classnames';
import React from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { Tip } from '@waldur/core/Tooltip';

export interface ActionButtonProps {
  title: string;
  action: (event?: any) => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  variant?: ButtonVariant;
}

export const wrapTooltip = (label, children, rest?) =>
  label ? (
    <Tip label={label} id="button-tooltip" {...rest}>
      {children}
    </Tip>
  ) : (
    children
  );

export const ActionButton: React.FC<ActionButtonProps> = (props) =>
  wrapTooltip(
    props.tooltip,
    <Button
      className={classNames(props.className, { disabled: props.disabled })}
      onClick={props.action}
      variant={props.variant}
    >
      {props.icon && <i className={props.icon} />} {props.title}
    </Button>,
  );

ActionButton.defaultProps = {
  className: 'ms-3',
  variant: 'light',
};
