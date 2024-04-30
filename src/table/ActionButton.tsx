import classNames from 'classnames';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { Tip } from '@waldur/core/Tooltip';

interface ActionButtonProps {
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

export const ActionButton: FC<ActionButtonProps> = ({
  className = 'ms-3',
  variant = 'light',
  ...props
}) =>
  wrapTooltip(
    props.tooltip,
    <Button
      className={classNames(className, { disabled: props.disabled })}
      onClick={props.action}
      variant={variant}
    >
      {props.icon && <i className={props.icon} />} {props.title}
    </Button>,
  );
